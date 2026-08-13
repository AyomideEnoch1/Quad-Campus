Add-Type -AssemblyName System.Drawing
$imgPath = "C:\Users\Ayomide Enoch\.gemini\antigravity\brain\20954af8-f0ef-4c62-9996-ac4e5f4f2af0\quad_app_icon_1786612562140.jpg"
$img = [System.Drawing.Image]::FromFile($imgPath)

$pngFormat = [System.Drawing.Imaging.ImageFormat]::Png

$img.Save("c:\Users\Ayomide Enoch\Desktop\QUAD\assets\icon.png", $pngFormat)
$img.Save("c:\Users\Ayomide Enoch\Desktop\QUAD\assets\adaptive-icon.png", $pngFormat)
$img.Save("c:\Users\Ayomide Enoch\Desktop\QUAD\assets\favicon.png", $pngFormat)
$img.Save("c:\Users\Ayomide Enoch\Desktop\QUAD\assets\splash.png", $pngFormat)

$img.Dispose()
Write-Host "App icons converted to true PNG successfully!"
