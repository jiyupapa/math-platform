<script setup lang="ts">
// 12부 공용 — 그림 기호표. 저량-유량도(sfd)·인과지도(cld)의 기호를 작은 그림 + 이름 + 뜻으로 한눈에 보여 준다.
// 1장 2·3절 끝에 펼쳐 두고, 그림이 나오는 장에서는 DetailsCard("🔍 그림 기호 다시 보기") 안에 넣는다.
// 기호 모양은 SfdDiagram·CldDiagram 과 같게 그린다(색은 토큰만). 두 열 표라 휴대폰에서도 가로 스크롤 없이 줄바꿈된다.
defineProps<{ kind: 'sfd' | 'cld' }>()

// 루프 기호(CldDiagram 과 같은 열린 원호 + 화살촉), 반지름만 작게
const R = 10
const cx = 30
const cy = 17
const a0 = (-70 * Math.PI) / 180
const a1 = (220 * Math.PI) / 180
const loopArc = `M${cx + R * Math.cos(a0)},${cy + R * Math.sin(a0)}A${R},${R} 0 1 1 ${cx + R * Math.cos(a1)},${cy + R * Math.sin(a1)}`
const hx = cx + R * Math.cos(a0)
const hy = cy + R * Math.sin(a0)
const loopHead = `M${hx - 5},${hy - 2.5}L${hx},${hy}L${hx - 1.7},${hy + 5}`
</script>

<template>
  <div class="my-4">
    <table class="w-full break-keep text-sm">
      <thead>
        <tr class="border-b border-slate-200 text-left text-slate-500">
          <th class="w-16 py-2 pr-3 font-medium">기호</th>
          <th class="py-2 font-medium">이름과 뜻</th>
        </tr>
      </thead>

      <!-- 저량-유량도 -->
      <tbody v-if="kind === 'sfd'" class="text-slate-700">
        <tr class="border-b border-slate-100">
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <rect x="6" y="6" width="48" height="22" rx="3" fill="var(--c-white)" />
              <rect x="6" y="17" width="48" height="11" fill="var(--c-sky-500)" opacity="0.28" />
              <rect x="6" y="6" width="48" height="22" rx="3" fill="none" stroke="var(--c-slate-700)" stroke-width="1.6" />
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>상자 = 저량</b>(stock). 지금 쌓여 있는 양. 시간을 멈추고 사진을 찍어도 셀 수 있는 것(사용자 수 120명). 단위에 시간이 붙지 않는다.
            <span class="text-slate-500">욕조로는 욕조에 담긴 물.</span>
          </td>
        </tr>
        <tr class="border-b border-slate-100">
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <path d="M4,17L46,17" stroke="var(--c-slate-500)" stroke-width="8" fill="none" />
              <path d="M4,17L46,17" stroke="var(--c-white)" stroke-width="4" fill="none" />
              <path d="M56,17L45,10L45,24Z" fill="var(--c-slate-500)" />
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>두 줄 파이프 = 유량</b>(flow). 저량을 늘리거나 줄이는 흐름. 화살촉 쪽으로 흐르고, 상자로 들어오면 유입, 나가면 유출.
            단위에 시간이 붙는다(20명/월). <span class="text-slate-500">욕조로는 수도꼭지·배수구의 물줄기.</span>
          </td>
        </tr>
        <tr class="border-b border-slate-100">
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <path d="M2,21L58,21" stroke="var(--c-slate-500)" stroke-width="8" fill="none" />
              <path d="M2,21L58,21" stroke="var(--c-white)" stroke-width="4" fill="none" />
              <path d="M22,13L22,29L30,21ZM38,13L38,29L30,21Z" fill="var(--c-white)" stroke="var(--c-slate-600)" stroke-width="1.4" stroke-linejoin="round" />
              <line x1="30" y1="21" x2="30" y2="9" stroke="var(--c-slate-600)" stroke-width="1.4" />
              <circle cx="30" cy="7" r="2.6" fill="var(--c-white)" stroke="var(--c-slate-600)" stroke-width="1.4" />
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>밸브</b>(valve, 나비 모양). 흐름이 지금 얼마나 센지 정하는 곳. 유량의 이름과 값은 밸브 옆에 쓴다.
            <span class="text-slate-500">욕조로는 수도꼭지 손잡이.</span>
          </td>
        </tr>
        <tr class="border-b border-slate-100">
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <g transform="translate(28,17)">
                <circle cx="-7" cy="2" r="9" fill="var(--c-white)" stroke="var(--c-slate-400)" />
                <circle cx="5" cy="-4" r="10" fill="var(--c-white)" stroke="var(--c-slate-400)" />
                <circle cx="8" cy="6" r="8" fill="var(--c-white)" stroke="var(--c-slate-400)" />
                <ellipse cx="2" cy="2" rx="10" ry="7" fill="var(--c-white)" />
              </g>
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>구름</b>(cloud). 이 모형이 신경 쓰지 않는 바깥. 흐름이 어디서 오고 어디로 가는지 따지지 않겠다는 표시(실무 용어로 source·sink).
            <span class="text-slate-500">욕조로는 수도관 너머 상수원과 하수도.</span>
          </td>
        </tr>
        <tr class="border-b border-slate-100">
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <circle cx="30" cy="20" r="5" fill="var(--c-white)" stroke="var(--c-slate-500)" stroke-width="1.5" />
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>작은 원 = 보조변수</b>(auxiliary variable). 쌓이지 않는 값. 미리 정해 두는 숫자(입소문 세기, 평균 사용 기간)나
            다른 값으로 그때그때 계산하는 값. 실험실의 다이얼은 대개 이것이다.
          </td>
        </tr>
        <tr>
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <path d="M5,27Q26,2 49,20" fill="none" stroke="var(--c-slate-400)" stroke-width="1.4" />
              <path d="M54,24L44.5,21.5L49.5,15Z" fill="var(--c-slate-400)" />
              <text x="47" y="12" font-size="12" font-weight="700" text-anchor="middle" fill="var(--c-indigo-600)">+</text>
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>가는 화살표 = 정보</b>(information link). '이 값을 보고 저 밸브를 정한다'는 길. 아무것도 옮기지 않는다.
            +는 같은 방향(이 값이 크면 저 값도 커짐), −는 반대 방향. <span class="text-slate-500">욕조로는 물 높이를 보고 손잡이를 돌리는 눈.</span>
          </td>
        </tr>
      </tbody>

      <!-- 인과지도 -->
      <tbody v-else class="text-slate-700">
        <tr class="border-b border-slate-100">
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <text x="30" y="22" font-size="13" font-weight="600" text-anchor="middle" fill="var(--c-slate-800)">만족도</text>
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>낱말 = 변수</b>(variable). 늘거나 줄 수 있는 양. '만족도', '사용자 수'처럼 많아지거나 적어질 수 있는 명사로 짓는다('도입하다'는 변수가 아니다).
          </td>
        </tr>
        <tr class="border-b border-slate-100">
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <rect x="4" y="5" width="52" height="24" rx="3" fill="var(--c-white)" stroke="var(--c-slate-600)" stroke-width="1.5" />
              <text x="30" y="21.5" font-size="10.5" font-weight="600" text-anchor="middle" fill="var(--c-slate-800)">사용자 수</text>
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>상자로 두른 낱말 = 저량인 변수</b>. 쌓이는 양이라는 표시. 그리지 않아도 되지만 표시해 두면 9장의 함정을 피하기 쉽다.
          </td>
        </tr>
        <tr class="border-b border-slate-100">
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <path d="M5,22L47,22" stroke="var(--c-slate-500)" stroke-width="1.6" />
              <path d="M55,22L45,17L45,27Z" fill="var(--c-slate-500)" />
              <text x="44" y="13" font-size="14" font-weight="700" text-anchor="middle" fill="var(--c-indigo-600)">+</text>
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>화살표와 +</b>. 화살표는 원인 → 결과. +는 같은 방향: 원인이 늘면 결과도 원래보다 커지고, 원인이 줄면 원래보다 작아진다(공부 시간 →+ 시험 점수).
          </td>
        </tr>
        <tr class="border-b border-slate-100">
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <path d="M5,22L47,22" stroke="var(--c-slate-500)" stroke-width="1.6" />
              <path d="M55,22L45,17L45,27Z" fill="var(--c-slate-500)" />
              <text x="44" y="14" font-size="16" font-weight="700" text-anchor="middle" fill="var(--c-rose-600)">−</text>
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>화살표와 −</b>. 반대 방향: 원인이 늘면 결과는 원래보다 작아지고, 원인이 줄면 원래보다 커진다(회의 시간 →− 집중해서 일하는 시간).
          </td>
        </tr>
        <tr class="border-b border-slate-100">
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <path d="M5,20L47,20" stroke="var(--c-slate-500)" stroke-width="1.6" />
              <path d="M55,20L45,15L45,25Z" fill="var(--c-slate-500)" />
              <path d="M24,12L24,28M30,12L30,28" stroke="var(--c-slate-600)" stroke-width="2" />
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>두 줄(∥) = 지연</b>(delay). 원인이 바뀌어도 결과가 늦게 따라온다는 표시. 지연이 낀 균형 루프는 출렁인다(6장).
          </td>
        </tr>
        <tr class="border-b border-slate-100">
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <path :d="loopArc" fill="none" stroke="var(--c-rose-600)" stroke-width="1.8" />
              <path :d="loopHead" fill="none" stroke="var(--c-rose-600)" stroke-width="1.8" stroke-linejoin="round" />
              <text :x="cx" :y="cy + 4.5" font-size="12" font-weight="800" text-anchor="middle" fill="var(--c-rose-600)">R</text>
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>R = 강화 루프</b>(reinforcing loop). 한 바퀴 따라 읽으면 처음 변화가 더 커져 돌아오는 고리. 고리 안 −가 짝수 개(0개 포함).
            <span class="text-slate-500">비유: 눈덩이.</span>
          </td>
        </tr>
        <tr>
          <td class="py-2 pr-3 align-top">
            <svg viewBox="0 0 60 34" class="h-8 w-14" aria-hidden="true">
              <path :d="loopArc" fill="none" stroke="var(--c-blue-600)" stroke-width="1.8" />
              <path :d="loopHead" fill="none" stroke="var(--c-blue-600)" stroke-width="1.8" stroke-linejoin="round" />
              <text :x="cx" :y="cy + 4.5" font-size="12" font-weight="800" text-anchor="middle" fill="var(--c-blue-600)">B</text>
            </svg>
          </td>
          <td class="py-2 align-top">
            <b>B = 균형 루프</b>(balancing loop). 한 바퀴 따라 읽으면 처음 변화를 거슬러 돌아오는 고리. 고리 안 −가 홀수 개.
            <span class="text-slate-500">비유: 온도 조절기.</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
