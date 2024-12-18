from kivy.config import Config

Config.set('graphics', 'width', '375')
Config.set('graphics', 'height', '650')

from kivymd.app import MDApp
from screens.tutorialone.tutorialone import TutorialOne
from screens.tutorialtwo.tutorialtwo import TutorialTwo
from screens.tutorialthree.tutorialthree import TutorialThree
from screens.tutorialfour.tutorialfour import TutorialFour
from screens.tutorialfive.tutorialfive import TutorialFive
from screens.tutorialsix.tutorialsix import TutorialSix
from screens.tutorialseven.tutorialseven import TutorialSeven
from screens.tutorialeight.tutorialeight import TutorialEight

class MainApp(MDApp):
    def build(self):
        self.title = "Kivy/kivyMD Tutorials"

    def on_start(self):
        # self.root.current = 'tutorial_one'
        # self.root.current = 'tutorial_two'
        # self.root.current = 'tutorial_three'
        # self.root.current = 'tutorial_four'
        # self.root.current = 'tutorial_five'
        # self.root.current = 'tutorial_six'
        # self.root.current = 'tutorial_seven'
        self.root.current = 'tutorial_eight'

if __name__ == "__main__":
    MainApp().run()
