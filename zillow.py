import xml.dom.minidom
import urllib2

zwskey="X1-ZWz1drphtezkln_76gmj"

addresses = [
    "6 Washington",
    "21 Manassas",
    "280 Pearl",
    "55 Ellery",
    "50 Follen",
    "51 Granite",
    "992 Memorial",
    "83 Trowbridge",
    "1 Dana",
    "45 Regent",
    "90 Alpine",
    "21 Francis",
    "112 Avon Hill",
    "9 Bellevue",
    "4 Blanchard Rd",
    "34 Shea",
    "5 Fountain",
    "14 Marcella",
    "39 Saint Saveur",
    "35 Pemberton",
    "46 Shepard",
    "31 Market",
    "99 Howard",
    "88 Pearl",
    "208 Western",
    "285 Windsor",
    "26 Cambridgepark",
    "211 Erie",
    "129 Franklin",
    "27 Gurney",
    "149 Prospect",
    "27 Linnaean",
    "20 Dudley",
    "60 Otis St",
    "130 Mount Auburn St",
    "2 Michael Way",
    "263 Columbia St",
    "6 Hurlbut St",
    "199 Harvard St",
    "168 River St",
    "400 Washington St",
    "12 Traill St",
    "74 Field St",
    "21 Walden Square Rd",
    "7 Wendell St",
    "15 Normandy Ave",
    "6 Gibson Ter",
    "94 Pine St",
    "23 Magee St",
    "175 Richdale Ave",
    "168 River St",
    "246 Brattle St"
]

city = "Cambridge,MA"


# Get data

def get_filename(address):
    return 'data/zillow/' + address.replace(' ', '-').lower()

def get_zillow_url(address):
    escaped_address = address.replace(' ','+')
    url = 'http://www.zillow.com/webservice/GetDeepSearchResults.htm?'
    url += 'zws-id=%s&address=%s&citystatezip=%s' % (zwskey, escaped_address,city)
    return url

def get_zillow_data_from_api(address):
    url = get_zillow_url(address)
    return urllib2.urlopen(url).read();

def get_zillow_data_from_local(address):
    with open(get_filename(address), 'r') as f:
        return f.read()

def get_xml(address):
    return xml.dom.minidom.parseString(get_zillow_data_from_local(address))


# Parsing

_parse_setup = [
    ["zipcode", "zipcode", str],
    ["use", "useCode", str],
    ["year", "yearBuilt", int],
    ["sqft", "finishedSqFt", int],
    ["bath", "bathrooms", float],
    ["bed", "bedrooms", int],
    ["rooms", "totalRooms", int],
    ["price", "amount", str]
]

def get_address_data(address):
    doc = get_xml(address)
    code = int(doc.getElementsByTagName('code')[0].firstChild.data)
    if code != 0: 
        return []
    results = doc.getElementsByTagName('result')
    return map(get_address_data_from_result_element, results)

def get_address_data_from_result_element(result):
    row = {}
    for key, xml_attribute, parser in _parse_setup:
        xml_elements = result.getElementsByTagName(xml_attribute)
        if not xml_elements:
            row[key] = None
            continue
        xml_element = xml_elements[0].firstChild
        if not xml_element:
            row[key] = None
            continue
        row[key] = parser(xml_element.data)
    return row


# Helpers

def get_price_list():
    return map(get_address_data, addresses)

def save_all_zillow_data():
    for address in addresses:
        save_zillow_data(address)

def save_zillow_data(address):
    with open(get_filename(address), 'w') as f:
        f.write(get_zillow_data_from_api(address))


