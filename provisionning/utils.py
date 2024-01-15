#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from random import choices


def generateID():
    st = "23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz"
    return "".join(choices(st, k=17))


def progress(prefixe, current_value, max_value):
    percent = round(100*current_value/max_value)
    message = f"{prefixe} {percent}% - ["+"#"*int(percent/5)+"."*(20-int(percent/5))+"]"
    print(message, end='\r')
