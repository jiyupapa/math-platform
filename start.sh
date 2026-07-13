#!/usr/bin/env bash
# 수포자를 위한 AI 수학 시리즈 — 개발 서버 실행 스크립트 (모노레포 · npm workspaces)
set -euo pipefail
cd "$(dirname "$0")"

# ── npm(Node.js) 확인 ────────────────────────────────────────
command -v npm >/dev/null 2>&1 || {
  echo "[오류] npm 을 찾을 수 없습니다. Node.js 를 먼저 설치하세요: https://nodejs.org"
  exit 1
}

# ── 최초 1회: node_modules 없으면 자동 설치 ──────────────────
if [ ! -d node_modules ]; then
  echo "[설치] node_modules 가 없어 npm install 을 실행합니다 (전 워크스페이스 링크)..."
  npm install
fi

# 번호/이름 → 앱 폴더명
resolve() {
  case "$1" in
    0|portal) echo portal ;;
    [1-9]|1[01]) echo "part$1" ;;
    part[1-9]|part1[01]) echo "$1" ;;
    *) echo "" ;;
  esac
}

dev() {
  echo
  echo "[개발 서버] $1  →  Vite HMR.  Ctrl+C 로 종료."
  echo
  npm run dev -w "apps/$1/web"
}

# 전체(12개 앱) 빌드 후 http://localhost:4173 한 origin 으로 서빙
serve_all() {
  echo
  echo "[전체] 12개 앱 전부 빌드 후 http://localhost:4173 한 origin 으로 서빙합니다 ..."
  echo "       (프로덕션 빌드 — HMR 없음. Ctrl+C 로 종료.)"
  echo
  npm run deploy:build && npm run deploy:serve
}

# ── 인자로 바로 지정: ./start.sh all | part1 | 1 ─────────────
if [ "$#" -ge 1 ]; then
  case "$1" in
    a|A|all|ALL) serve_all; exit ;;
  esac
  app="$(resolve "$1")"
  [ -n "$app" ] || { echo "[오류] 알 수 없는 앱: $1"; exit 1; }
  dev "$app"
  exit 0
fi

# ── 대화식 메뉴 ──────────────────────────────────────────────
while true; do
  cat <<'MENU'
============================================================
   수포자를 위한 AI 수학 시리즈   (모노레포 · npm workspaces)
============================================================
   0)  통합 포털            portal
   1)  1부 선형대수학        part1
   2)  2부 미분             part2
   3)  3부 확률과 통계       part3
   4)  4부 트랜스포머        part4
   5)  5부 정보이론          part5
   6)  6부 LLM 조련          part6
   7)  7부 임베딩 기하학      part7
   8)  8부 최적화            part8
   9)  9부 수치 계산         part9
  10)  10부 스케일링·평가     part10
  11)  11부 에이전트          part11
------------------------------------------------------------
   A)  전체 빌드 후 통합 서빙 → localhost:4173   [인자: all]
   I)  의존성 재설치          (npm install)
   Q)  종료
============================================================
MENU
  read -rp "실행할 항목: " choice
  case "$choice" in
    q|Q) exit 0 ;;
    i|I) npm install ;;
    a|A) serve_all ;;
    *)
      app="$(resolve "$choice")"
      if [ -n "$app" ]; then dev "$app"; else echo "잘못된 선택입니다."; sleep 1; fi
      ;;
  esac
done
