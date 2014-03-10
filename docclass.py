from collections import defaultdict
import math
import re

def getwords(doc):
    splitter = re.compile('\\W*')
    words = (s.lower() for s in splitter.split(doc) if 2 < len(s) < 20)
    return {w: 1 for w in words}


class Classifier(object):

    def __init__(self, getfeatures, filename=None):
        # Counts of feature/category combinations
        self.feature_category_combinations = defaultdict(lambda: defaultdict(lambda: 0))
        # Counts of documents in each category
        self.category_count = defaultdict(lambda: 0)
        self.getfeatures = getfeatures

    def increase_feature_category_count(self, feature, category):
        self.feature_category_combinations[feature][category] += 1

    def increase_category_count(self, category):
        self.category_count[category] += 1

    def get_feature_category_count(self, feature, category):
        return float(self.feature_category_combinations[feature][category])

    def get_category_count(self, category):
        return self.category_count[category]

    def get_total_count(self):
        return sum(self.category_count.values())

    def get_categories(self):
        return self.category_count.keys()

    def train(self, item, category):
        features = self.getfeatures(item)
        for f in features:
            self.increase_feature_category_count(f, category)
        self.increase_category_count(category)

    def probability_of_feature_given_category(self, feature, category):
        if self.get_category_count(category) == 0:
            return 0
        return self.get_feature_category_count(feature, category) / self.get_category_count(category)
