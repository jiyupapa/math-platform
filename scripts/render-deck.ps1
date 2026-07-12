# scripts/render-deck.ps1 — 발표 덱 전 슬라이드를 PNG 로 렌더 → docs/hackathon/slides/slideNN.png
# 리허설·검토용 스냅숏. 덱을 재생성(scripts/build-pitch-deck.py)했으면 이 스크립트로 렌더도 갱신할 것.
# 요구: Windows + PowerPoint 설치(COM 자동화). 실행: powershell -File scripts/render-deck.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$pptx = Join-Path $root 'docs\hackathon\11_pitch_deck.pptx'
$out = Join-Path $root 'docs\hackathon\slides'
New-Item -ItemType Directory -Force $out | Out-Null

$pp = New-Object -ComObject PowerPoint.Application
$pres = $pp.Presentations.Open($pptx, -1, 0, 0)   # ReadOnly, Untitled=No, WithWindow=No
$pres.Export($out, 'PNG', 1920, 1080)
$count = $pres.Slides.Count
$pres.Close()
$pp.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($pp) | Out-Null

# Office 언어에 따라 '슬라이드N.PNG' / 'SlideN.PNG' 로 나옴 → 정렬되는 slideNN.png 로 정규화
Get-ChildItem $out | ForEach-Object {
  if ($_.Name -match '^(슬라이드|Slide)(\d+)\.PNG$') {
    Move-Item $_.FullName (Join-Path $out ('slide{0:d2}.png' -f [int]$Matches[2])) -Force
  }
}
Write-Output ("렌더 완료 — {0}장 → {1}" -f $count, $out)
Get-ChildItem $out -Filter 'slide*.png' | Sort-Object Name | Select-Object Name, Length
