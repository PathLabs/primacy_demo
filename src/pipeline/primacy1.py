#!/usr/bin/env python


'''
Desc: Placeholder script for the Primacy pipeline

Authors:
    - Chance Nelson <chance-nelson@nau.edu>
'''


import sys
import json


if __name__ == '__main__':
    out = '''
{"primer_collection": {"params": {"pcr_salts": {"Na": 50, "K": 0, "Tris": 0, "Mg": 0, "dNTPs": 0}, "background_seq": []}}, "sequences": {"test1": {"seq": "AGCGGGGAGGAAGGGAGTAAAGTTAATACCTTTGCTCATTGACGTTACCCGCAGAAGAAGCACCGGCTAACTCCGTGCCAGCAGCCGCGGTAATACGGAGGGTGCAAGCGTTAATCGGAATTACTGGGCGTAAAGCGCACGCAGGCGGTTTGTTAAGTCAGATGTGAAATCCCCGGGCTCAACCTGGGAACTGCATCTGATACTGGCAAGCTTGAGTCTCGTAGAGGGGGGTAGAATTCCAGGTGTAGCGGTGAAATGCGTAGAGATCTGGAGGAATACCGGTGGCGAAGGCGGCCCCCTGGACGAAGACTGACGCTCAGGTGCGAAAGCGTGGGGAGCAAACAGGATTAGATACCCTGGTAGTCCACGCCGTAAACGATGTCGACTTGGAGGTTGTGCCCTTGAGGCGTGGCTTCCGGAGCTAACGCGTTAAGTCGACCGCCTGGGGAGTACGGCCGCAAGGTTAAAACTCAAATGAATTGACGGGGGCCCGCACAAGCGGTGGAGCATGTGGTTTAATTCGATGCAACGCGAAGAACCTTACCTGGTCTTGACATCCACGGAAGTTTTCAGAGATGAGAATGT", "target_start": 100, "target_end": 150, "primer_len_range": {"min": 18, "max": 22}, "outfile": "test/seq_test1.json"}, "test2": {"seq": "AACAAGGTAGATAAAATATTTGATAGATTCTATCGTGTAGATAAAGCACGTACACGTAAGATGGGTGGTACAGGACTTGGTCTAGCTATTTCCAAAGAGATTGTCGAAGCACATAACGGTCGAATTTGGGCTAACAGTGTAGAAGGACAAGGTACGTCAATCTTTATTACGCTTCCTTGCGAAATCATTGAAGACGGTGATTGGGATGAATAACAAAGAACATACTAAATCAATTATTTTAGTCCTACTCGTCTTGATGAGTATCGTTTTGACATACATGGTCTGGAACTTTTCTCCAGACCTTTCAAATATTGATAACACGGATAATAGTAAAAGTGATAAGCCTAAACCACTTACTAAACCAATGACTGCAGAAATGGAAGGAACAATCACACCATTTCAAATCGTGCATTCTAGAGATGATAAATCTCAAGGAACAGTAGCATCAGGTGCAGTCTTAGATAAGATGATTCAACCTTTAAAGAATCAAGAAGTTAAATCTGTATCACATCTGAAAAGGGAACATAACCTTGTTATCCCTGAACTAAGTAACAACTTTATTGTCCTAGATTTCACTTATGATTT", "target_start": 150, "target_end": 160, "primer_len_range": {"min": 18, "max": 22}, "outfile": "test/seq_test2.json"}}}
'''
    open(sys.argv[1], 'w').write(out)
