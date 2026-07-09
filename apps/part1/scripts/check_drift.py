# -*- coding: utf-8 -*-
"""시리즈 공용 파일 드리프트 점검 — 1부(linear-algebra) = 표준(골든 카피).

사용: python scripts/check_drift.py   (아무 위치에서나 실행 가능)

- EXACT  : 모든 부에서 1부와 바이트 단위로 동일해야 하는 파일. 다르면 실패(exit 1).
- OPTIONAL: 표준 세트에 속하지만 아직 안 가져간 부가 있어도 되는 파일. 없으면 정보만 표시.
- THEMED : 부별 설정(스토리지 키 접두사·튜터 프롬프트 주제·챕터 목록)이 섞여 있어
           동일할 수 없는 파일. 해시만 나란히 보여 준다 (눈으로 비정상 드리프트 감시).
- QuizSet.vue 은 스토리지 접두사 한 줄만 다른 것이 정상 — 접두사를 정규화한 뒤 EXACT 비교한다.

새 부를 추가하면 PARTS 에 (저장소명, 접두사) 를 추가할 것.
"""
import hashlib
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')  # Windows 콘솔(cp949)에서도 이모지·대시 출력

ROOT = Path(__file__).resolve().parents[2]  # C:\STUDY\MATH
# (디렉토리명, localStorage 접두사). 접두사는 디렉토리명과 무관한 고정값이라
# 디렉토리를 rename 해도 바뀌지 않는다(바꾸면 사용자 진도 저장이 끊긴다).
STD = 'part1-linear-algebra'
PARTS = [
    ('part2-differentiation', 'diff'),
    ('part3-probstat', 'stat'),
    ('part4-transformer', 'tf'),
    ('part5-information-theory', 'it'),
]
STD_PREFIX = 'la'

EXACT = [
    'web/src/components/MathBlock.vue',
    'web/src/components/ConceptCard.vue',
    'web/src/components/ChartView.vue',
    'web/src/components/Quiz.vue',
    'web/src/components/StepQuiz.vue',
    'web/src/components/quizGroup.ts',
    'web/src/components/ReviewFlag.vue',
    'web/src/lib/ollama.ts',
]
OPTIONAL = [
    'web/src/components/DetailsCard.vue',
    'web/src/components/NotebookCard.vue',
]
THEMED = [
    'web/src/components/TutorChat.vue',
    'web/src/stores/progress.ts',
    'web/src/stores/review.ts',
    'notebooks/tutor.py',
]
NORMALIZED = ['web/src/components/QuizSet.vue']  # 스토리지 접두사만 정규화 후 EXACT 비교


def digest(text: str) -> str:
    return hashlib.md5(text.encode('utf-8')).hexdigest()[:8]


def read(repo: str, rel: str) -> str | None:
    p = ROOT / repo / rel
    return p.read_text(encoding='utf-8') if p.is_file() else None


failed = False
name_w = max(len(Path(r).name) for r in EXACT + OPTIONAL + THEMED + NORMALIZED) + 1
header = f'{"파일":<{name_w}} ' + ' '.join(f'{p[0][:12]:<12}' for p in PARTS)

print(f'기준: {STD}\n')
print('[EXACT — 1부와 동일해야 함]')
for rel in EXACT:
    std = read(STD, rel)
    row = f'{Path(rel).name:<{name_w}} '
    for repo, _ in PARTS:
        other = read(repo, rel)
        if other is None:
            row += f'{"❌없음":<12}'
            failed = True
        elif other == std:
            row += f'{"✓":<12}'
        else:
            row += f'{"❌" + digest(other):<12}'
            failed = True
    print(row)

print('\n[NORMALIZED — 스토리지 접두사만 다른 것이 정상]')
for rel in NORMALIZED:
    std = (read(STD, rel) or '').replace(f'`{STD_PREFIX}-quizset-v1:', '`@-quizset-v1:')
    row = f'{Path(rel).name:<{name_w}} '
    for repo, prefix in PARTS:
        raw = read(repo, rel)
        other = (raw or '').replace(f'`{prefix}-quizset-v1:', '`@-quizset-v1:')
        if raw is None:
            row += f'{"❌없음":<12}'
            failed = True
        elif other == std:
            row += f'{"✓":<12}'
        else:
            row += f'{"❌" + digest(raw):<12}'
            failed = True
    print(row)

print('\n[OPTIONAL — 아직 안 가져간 부는 "-"]')
for rel in OPTIONAL:
    std = read(STD, rel)
    row = f'{Path(rel).name:<{name_w}} '
    for repo, _ in PARTS:
        other = read(repo, rel)
        if other is None:
            row += f'{"-":<12}'
        elif other == std:
            row += f'{"✓":<12}'
        else:
            row += f'{"❌" + digest(other):<12}'
            failed = True
    print(row)

print('\n[THEMED — 부별 설정 파일: 해시만 표시 (기준 해시와 눈으로 비교)]')
for rel in THEMED:
    std = read(STD, rel)
    row = f'{Path(rel).name:<{name_w}} 기준:{digest(std) if std else "없음"}  '
    for repo, _ in PARTS:
        other = read(repo, rel)
        row += f'{digest(other) if other is not None else "없음":<12}'
    print(row)

print()
if failed:
    print('❌ 드리프트 발견 — 위 ❌ 항목을 1부 기준으로 동기화하세요.')
    sys.exit(1)
print('✅ 드리프트 없음 (EXACT·NORMALIZED 전부 1부와 일치)')
