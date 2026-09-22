import re, json
t = open('bkl.txt', encoding='utf-8').read()
pages = {int(m.group(1)): m.end() for m in re.finditer(r'=====PDF (\d+)=====', t)}
def page_text(p): return t[pages[p]: t.find('=====PDF', pages[p])]

def names_on(p, which):
    s = page_text(p)
    i = s.index('\nNames\n')
    s = s[i:]
    m = re.search(which + r':(.*?)(?:\n(?:Female|Pronunciation|Religion|2\. Traits)|$)', s, re.S)
    body = re.sub(r'\s+', ' ', m.group(1))
    body = body.split('. ')[0]            # stop at the first sentence end
    out = [n.strip(' .') for n in body.split(',')]
    return [n for n in out if n]

CULT = [  # id, label, page
    ('cymric', 'Cymric', 24), ('irish', 'Irish', 25), ('pict', 'Pict', 26),
    ('roman', 'Roman', 27), ('saxon', 'Saxon', 28), ('aquitanian', 'Aquitanian', 29),
    ('byzantine', 'Byzantine', 78), ('danish', 'Danish', 82), ('french', 'French', 86),
    ('german', 'German', 91), ('spanish', 'Spanish', 95), ('italian', 'Italian', 99),
    ('occitanian', 'Occitanian', 104), ('zazamanc', 'Zazamanc', 112), ('faerie', 'Children of Faeries', 116),
]
cultures = {}
for cid, label, p in CULT:
    male = names_on(p, 'Male')
    try: female = names_on(p, 'Female')
    except Exception: female = []
    cultures[cid] = dict(label=label, page=p, male=male, female=female)

# Book fixes: missing comma in the Pict list; Pict and Roman female rules.
pm = cultures['pict']['male']
if 'Uuroid Uvan' in pm: i = pm.index('Uuroid Uvan'); pm[i:i+1] = ['Uuroid', 'Uvan']
cultures['pict']['female'] = []   # p26: "Use Cymric names."
cultures['pict']['femaleFrom'] = 'cymric'
cultures['roman']['female'] = []  # p27: male names feminized to -ia, except -rix
def fem(n):
    if n.endswith('ius'): return n[:-3] + 'ia'
    if n.endswith('us'): return n[:-2] + 'ia'
    return None
cultures['roman']['femaleRule'] = [f for f in (fem(n) for n in cultures['roman']['male']) if f]

# Mainstream homelands, p22.
KEY = {'cymric': 'cymric', 'british': 'cymric', 'roman': 'roman', 'rom.': 'roman', 'pict': 'pict',
       'irish': 'irish', 'saxon': 'saxon', 'aquitainian': 'aquitanian', 'aquitaine': 'aquitanian'}
homes = []
seen = set()
for line in open('mainstream.txt', encoding='utf-8'):
    if '|' not in line: continue
    name, rest = [x.strip() for x in line.split('|', 1)]
    name = name.replace(' (City)', '')
    rest = rest.split('The Mainstream')[0]
    after = re.sub(r'^[,\s]*(\(City\))?\s*(\[[^\]]*\]\s*)+[,:]?\s*', '', rest)
    after = after.replace('Culture/Religion:', '').strip()
    first = after.split('/')[0].split(',')[0].strip().lower()
    c = KEY[first]
    if name in seen: continue
    seen.add(name); homes.append([name, c, 22])

CONT = {
 'byzantine': (78, ['Syria', 'Illyricum', 'Constantinople']),
 'danish': (82, ['Jutland', 'Skane', 'Zealand']),
 'french': (86, ['Austrasia', 'Neustria', 'Orléans', 'Ile de France']),
 'german': (90, ['Frisia', 'Alamannia', 'Burgundia', 'Saxony', 'Thuringia', 'Bavaria', 'Lombardia']),
 'spanish': (95, ['Tarraconensis', 'Carthaginiensis', 'Baetica', 'Lusitania']),
 'italian': (99, ['Verona', 'Venice', 'Amalfi', 'Pisa', 'Genoa', 'Milan', 'Florence', 'Rome', 'Apulia', 'Ravenna', 'Syracuse']),
 'occitanian': (104, ['Delfinat', 'Lengadoc', 'Provença', 'Catalonha', 'Tolosa']),
 'zazamanc': (112, ['Berbers', 'Vandals', 'Egypt', 'Araby', 'Patelamunt']),
 'faerie': (116, ['Mount Feimurgan']),
}
# Starred cities are Urban Roman (pp95, 104).
ROMAN_CITIES = {95: ['Tarraco', 'Cartagena', 'Corduba', 'Emerita Augusta'],
                104: ['Liyon', 'Carcasona', 'Narbonne', 'Marseilles', 'Toulouse']}
for c, (p, lst) in CONT.items():
    for n in lst: homes.append([n, c, p])
for p, lst in ROMAN_CITIES.items():
    for n in lst: homes.append([n, 'roman', p])

# Every homeland must appear verbatim in the book text.
flat = re.sub(r'\s+', ' ', t)
for n, c, p in homes: assert n in flat, n
for c in cultures.values():
    for n in c['male'] + c['female']: assert n in flat, n

js = ['// Generated from The Book of Knights & Ladies (Pendragon 5th ed., 2007) by notes/gen-bkl.py.',
      '// Homelands (p22 and each continental Homeland table) and each culture\'s name lists.',
      '// Page numbers are the book\'s printed pages. Nothing here is invented.',
      '',
      'export const BKL_CULTURES = ' + json.dumps(cultures, ensure_ascii=False, indent=1) + ';',
      '',
      '// [homeland, culture, page]',
      'export const BKL_HOMELANDS = ' + json.dumps(homes, ensure_ascii=False) + ';', '']
open('bkl.mjs', 'w', encoding='utf-8').write('\n'.join(js))
for k, v in cultures.items(): print(k, len(v['male']), len(v['female']), len(v.get('femaleRule', [])), sum(1 for h in homes if h[1] == k))
print(len(homes))
