from ebooklib import epub

import sys
import os
import yaml

def file_content(file, mode="r"):
    if not os.path.isfile(file):
        msg = f"No se encontro el archivo: {file}"
        raise Exception(msg)
        return None
    with open(file, mode) as f:
        return f.read()

def init_ebook(schema):
    book = epub.EpubBook()
    book.set_identifier(schema['metadata']['identifier'])
    book.set_title(schema['metadata']['title'])
    book.set_language(schema['metadata']['language'])
    for author in schema['metadata']['authors']:
        book.add_author(author)
    return book, schema['metadata']['language']

def add_chapter(book, chapter, chapter_number, language):
    xhtml_file = f"ch_{chapter_number:03}.xhtml"
    ch = epub.EpubHtml(
        title=chapter['title'],
        file_name=xhtml_file,
        lang=language)
    ch.content = "".join([
        str(file_content(os.path.join('assets', 'text', file)))
        for file in chapter['content']
        ])
    ch.add_link(href='style/chapter.css', rel='stylesheet', type='text/css')
    book.add_item(ch)
    return xhtml_file, chapter['title'], ch

def add_image(book, image):
    book.add_item(epub.EpubImage(
        file_name=f"static/{image['file']}",
        media_type=image['media_type'],
        content=file_content(os.path.join('assets', 'img', image['file']), 'rb'),
        ))

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Solo debe haber un argumento: el nombre del archivo esquema (*.yml)")
        exit(1)
    file = sys.argv[1]
    if file[-3:].lower() != "yml":
        print("Debe enviarse un archivo *.yml")
        exit(2)
    if not file_content(file):
        print("No se ha encontrado el archivo esquema (*.yml)")
        exit(3)
    with open(file, "r") as f:
        esquema = yaml.load(f, Loader=yaml.FullLoader)

    ebook, idioma = init_ebook(esquema)

    if 'cover' in esquema.keys():
        ebook.set_cover(
            esquema['cover'],
            file_content(os.path.join('assets', 'img', esquema['cover']), 'rb'))

    ebook.add_item(epub.EpubItem(
        'style_ch', 'style/chapter.css', 'text/css',
        file_content(os.path.join('assets', 'css', 'styles.css'))))

    capitulos = [
        add_chapter(ebook, capitulo, n, idioma)
        for n, capitulo in enumerate(esquema['chapters'])]
    [add_image(ebook, imagen) for imagen in esquema['images']]
    ebook.toc = [
        epub.Link(capitulo[0], capitulo[1], capitulo[0])
        for capitulo in capitulos]

    epub_file_name = file[:-4] + ".epub"

    ebook.add_item(epub.EpubNcx())
    ebook.add_item(epub.EpubNav())

    if 'cover' in esquema.keys():
        ebook.spine = ['cover', 'nav', ] + [capitulo[2] for capitulo in capitulos]
    else:
        ebook.spine = ['nav', ] + [capitulo[2] for capitulo in capitulos]

    epub.write_epub(epub_file_name, ebook, {})
