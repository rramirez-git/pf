import os

from PIL import Image
from pytesseract import pytesseract

def get_text(image_path):
    img = Image.open(image_path)
    return pytesseract.image_to_string(img)

def proc_img(image_path):
    base_name, ext = os.path.splitext(image_path)
    with open(f"{base_name}.txt", "w") as f:
        txt = get_text(image_path)[:-1]
        f.write(txt)

for root, dirs, files in os.walk("."):
    for i, file in enumerate(files):
        if not file.endswith(".py"):
            print(f"{file:>50}\t{i+1:03}/{len(files):03}", end="\t")
            proc_img(file)
            print(f"\t{(i + 1) / len(files) * 100:06.2f} %")
