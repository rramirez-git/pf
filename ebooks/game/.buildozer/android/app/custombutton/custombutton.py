from kivy.uix.image import Image
from kivy.uix.button import ButtonBehavior
from kivymd.uix.behaviors import RectangularRippleBehavior, CircularRippleBehavior

class StartButton(RectangularRippleBehavior, ButtonBehavior, Image):
    pass

class PlayButton(CircularRippleBehavior, ButtonBehavior, Image):
    pass
