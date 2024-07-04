<?php
function input($var) {
    if(isset($_POST[$var]) && $_POST[$var] != "") {
        return $_POST[$var];
    }
    else if(isset($_GET[$var]) && $_GET[$var] != "") {
        return $_GET[$var];
    }
    return "";
}

function read_dir_files($path, $sort_by="name", $inv=false, $pattern="") {
    $objs = array();
    $dir = dir($path);
    while(($o = $dir->read()) !== false) {
        if(is_file( $path . "/" . $o)) {
            $objs[] = $o;
        }
    }
    $dir->close();
    if($sort_by == "name") {
        sort($objs);
        if($inv) {
            rsort(($objs));
        }
    } else if($sort_by == "ext") {
        $base = array();
        $exts = array();
        foreach($objs as $f)
        {
            $partes = explode(".", $f);
            if(count($partes) == 1)
            {
                $partes[1] == " ";
            }
            $base[] = implode(".", array_slice($partes, 0, count($partes) - 1));
            $exts[] = array_slice($partes, -1)[0];
        }
        if($inv) {
            array_multisort(
                $exts, SORT_DESC, SORT_STRING, $base, SORT_ASC, SORT_STRING);
        } else {
            array_multisort(
                $exts, SORT_ASC, SORT_STRING, $base, SORT_ASC, SORT_STRING);
        }
        foreach($base as $i => $b) {
            $objs[$i] = implode(".", array($b, $exts[$i]));
        }
    }
    $res = array();
    if($pattern) {
        foreach($objs as $f) {
            if(stristr($f, $pattern) !== false) {
                $res[] = $f;
            }
        }
        return $res;
    }
    return $objs;
}

function read_dir_dirs($path, $sort=true, $inv=false, $pattern="") {
    $objs = array();
    $dir = dir($path);
    while(($o = $dir->read()) !== false) {
        if( is_dir( $path . "/" . $o ) ) {
            if($o == "." || $o == "..") {
                continue;
            }
            $objs[] = $o;
        }
    }
    $dir->close();
    if($sort) {
        sort($objs);
        if($inv) {
            rsort(($objs));
        }
    }
    $res = array();
    if($pattern) {
        foreach($objs as $f) {
            if(stristr($f, $pattern) !== false) {
                $res[] = $f;
            }
        }
        return $res;
    }
    return $objs;
}

function read_dir($path, $pattern="") {
    $res = array();
    $res["files"] = read_dir_files($path, 'name', false, $pattern);
    $res["dirs"] = array();
    foreach(read_dir_dirs($path, true, false, $pattern) as $dir) {
        $res["dirs"][$dir] = read_dir($path . "/". $dir, $pattern);
    }
    return $res;
}

function display_thumb($src, $desired_width, $mime) {
    $source_image = null;
    if (preg_match('/jpg|jpeg/i',$mime))
        $source_image = imagecreatefromjpeg($src);
    else if (preg_match('/png/i',$mime))
        $source_image = imagecreatefrompng($src);
    else if (preg_match('/gif/i',$mime))
        $source_image = imagecreatefromgif($src);
    else if (preg_match('/bmp/i',$mime))
        $source_image = imagecreatefrombmp($src);
    $width = imagesx($source_image);
    $height = imagesy($source_image);
    $desired_height = floor($height * ($desired_width / $width));
    $virtual_image = imagecreatetruecolor($desired_width, $desired_height);
    imagecopyresampled(
        $virtual_image, $source_image, 0, 0, 0, 0,
        $desired_width, $desired_height, $width, $height);
    imagejpeg($virtual_image);
}

$base = input("root");
$endpoint = input("endpoint");
$thumbnail = input("thumbnail");
$width = input("width");
$cmd = input("cmd");

$base = $base ? $base : ".";
$width = $width ? $width : "100";

if($cmd == "ls") {
    echo json_encode(read_dir("$base/$endpoint"));
} else if ($cmd == "show") {
    $file = "{$base}/{$endpoint}";
    $type = mime_content_type($file);
    //echo $type . "\n\n";
    header("Content-type: {$type}");
    if(stripos($type, 'image') !== false && $thumbnail == "true") {
        display_thumb($file, intval($width), $type);
    } else {
        readfile($file);
    }
} else {
    echo "Command required";
}

/*
https://teresita.com.mx/cmd.php?cmd=ls&root=sie/Docu&endpoint=Masters%20MP
https://teresita.com.mx/cmd.php?cmd=show&root=sie/Docu&endpoint=Masters%20MP/ACE/ACE01/ACE01-005.png

https://teresita.com.mx/cmd.php?cmd=ls&root=sie/Docu/Masters%20MP
https://teresita.com.mx/cmd.php?cmd=show&root=sie/Docu/Masters%20MP&endpoint=ACE/ACE01/ACE01-005.png

http://localhost:2024/pf/cmd.php?cmd=ls&root=/home/rramirez/Descargas
http://localhost:2024/pf/cmd.php?cmd=show&root=/home/rramirez/Descargas&endpoint=FB_IMG_1558662156132.jpg
http://localhost:2024/pf/cmd.php?cmd=show&root=/home/rramirez/Descargas&endpoint=FB_IMG_1558662156132.jpg&thumbnail=true&width=50
*/
?>
