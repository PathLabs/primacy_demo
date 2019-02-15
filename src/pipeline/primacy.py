#!/usr/bin/env python


'''
Desc: Placeholder script for the Primacy pipeline

Authors:
    - Chance Nelson <chance-nelson@nau.edu>
'''


import sys
import json


if __name__ == '__main__':
    try:
        json_obj = json.loads(open(sys.argv[1]).read())
    except e:
        print("bad JSON object")


    if 'range-lower' in json_obj and 'range-upper' in json_obj:
        json_obj['range-diff'] = json_obj['range-upper'] - json_obj['range-lower']

    open(sys.argv[1], 'w').write((json.dumps(json_obj)))
