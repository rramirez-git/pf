from kivy.uix.screenmanager import Screen
from custombutton.custombutton import StartButton, PlayButton

class TutorialSeven(Screen):

    def button_pressed(self):
        print("on_press")

    def button_released(self):
        print("on_release")
