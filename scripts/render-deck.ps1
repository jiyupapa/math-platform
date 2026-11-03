# scripts/render-deck.ps1 — 발표 덱 전 슬라이드를 PNG 로 렌더 → docs/hackathon/slides/slideNN.png
# 리허설·검토용 스냅숏. 덱을 재생성(scripts/build-pitch-deck.py)했으면 이 스크립트로 렌더도 갱신할 것.
# 파일 이름은 바닥글 번호(slide01~16.png). ④ 다음의 번호 없는 영상 장은 slide04_video.png(포스터 화면).
# 요구: Windows + PowerPoint 설치(COM 자동화). 실행: powershell -File scripts/render-deck.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$pptx = Join-Path $root 'docs\hackathon\11_pitch_deck.pptx'
$out = Join-Path $root 'docs\hackathon\slides'
$tmp = Join-Path $out '_export'   # 내보내기는 따로 받아 옮긴다 — 기존 slideNN.png 와 이름이 섞이지 않게
New-Item -ItemType Directory -Force $out | Out-Null
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }

$pp = New-Object -ComObject PowerPoint.Application
$pres = $pp.Presentations.Open($pptx, -1, 0, 0)   # ReadOnly, Untitled=No, WithWindow=No
$pres.Export($tmp, 'PNG', 1920, 1080)
$count = $pres.Slides.Count
# 실제 순서 → 파일 이름. 영상(미디어 도형, Type 16)이 있는 장은 번호를 세지 않고 앞 장 번호 + _video
$names = @{}
$no = 0
for ($i = 1; $i -le $count; $i++) {
  if (@($pres.Slides.Item($i).Shapes | Where-Object { $_.Type -eq 16 }).Count) { $names[$i] = 'slide{0:d2}_video.png' -f $no }
  else { $no++; $names[$i] = 'slide{0:d2}.png' -f $no }
}
$pres.Close()
$pp.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($pp) | Out-Null

# Office 언어에 따라 '슬라이드N.PNG' / 'SlideN.PNG' 로 나옴
Get-ChildItem $tmp | ForEach-Object {
  if ($_.Name -match '^(슬라이드|Slide)(\d+)\.PNG$') {
    Move-Item $_.FullName (Join-Path $out $names[[int]$Matches[2]]) -Force
  }
}
Remove-Item $tmp -Recurse -Force
Write-Output ("렌더 완료 — {0}장 → {1}" -f $count, $out)
Get-ChildItem $out -Filter 'slide*.png' | Sort-Object Name | Select-Object Name, Length
