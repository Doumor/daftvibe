# from kivy.app import App
# from kivy.uix.button import Button
#
# class DaftApp(App):
#     def build(self):
#         return Button(text = "Hello World")
#
# if __name__ == "__main__":
#     DaftApp().run()

from kivy.lang import Builder
from kivy.uix.floatlayout import FloatLayout

from kivymd.app import MDApp
from kivymd.uix.tab import MDTabsBase

KV = '''
BoxLayout:
    orientation: "vertical"

    MDToolbar:
        title: "Example Tabs"

    MDTabs:
        id: tabs
        on_tab_switch: app.on_tab_switch(*args)


<Tab>:

    MDLabel:
        id: label
        text: "Tab 1"
        halign: "center"
    MDFlatButton:
        text: "[color=#00ffcc]MDFLATBUTTON[/color]"
        markup: True
'''


class Tab(FloatLayout, MDTabsBase):
    '''Class implementing content for a tab.'''


class DaftApp(MDApp):
    def build(self):
        return Builder.load_string(KV)

    def on_start(self):
        for i in range(3):
            if i == 0:
                self.root.ids.tabs.add_widget(Tab(text="Tab 1"))

            elif i == 1:
                self.root.ids.tabs.add_widget(Tab(text="Tab 2"))

            elif i == 2:
                self.root.ids.tabs.add_widget(Tab(text="Tab 3"))


    def on_tab_switch(
        self, instance_tabs, instance_tab, instance_tab_label, tab_text
    ):
        '''Called when switching tabs.

        :type instance_tabs: <kivymd.uix.tab.MDTabs object>;
        :param instance_tab: <__main__.Tab object>;
        :param instance_tab_label: <kivymd.uix.tab.MDTabsLabel object>;
        :param tab_text: text or name icon of tab;
        '''

        instance_tab.ids.label.text = tab_text


DaftApp().run()
