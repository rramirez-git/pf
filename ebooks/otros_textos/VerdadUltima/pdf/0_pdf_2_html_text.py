import sys
import pdfplumber
from PIL import Image
from IPython.display import display
import io

def extract_text(pages, base_name):
    text = ""
    for idx, page in enumerate(pages):
        print(f"Extracting text {idx + 1} / {len(pages)}")
        text += page.extract_text() + "\n"
    with open(f"{base_name}.html", "w") as file:
        file.write(text)
    # print(text)

def page_images(pages, base_name):
    for p, page in enumerate(pages):
        page.to_image(500).save(f"{base_name}_page_{p + 1:02}.png")

def save_images(pages, base_name):
    img_num = 1
    for p, page in enumerate(pdf_stream.pages):
        for image in page.images:
            image_path = f'{base_name}_{img_num:02}.png'
            img_num += 1
            real_image = Image.open(io.BytesIO(image['stream'].get_data()))
            real_image.save(image_path)

pdf_file = sys.argv[1]
file_base_name = "".join(pdf_file.split(".")[:-1])

pdf_stream = pdfplumber.open(pdf_file)

extract_text(pdf_stream.pages, file_base_name)
#page_images(pdf_stream.pages, file_base_name)
#save_images(pdf_stream.pages, file_base_name)

pdf_stream.close()
