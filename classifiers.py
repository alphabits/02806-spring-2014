from collections import defaultdict
import math
import operator


class BaseClassifier(object):

    def __init__(self, get_features, filename=None):
        self._feature_category_counts = defaultdict(lambda: defaultdict(lambda: 0))
        self._category_counts = defaultdict(lambda: 0)
        self.get_features = get_features

    def increase_feature_category_count(self, feature, category):
        self._feature_category_counts[feature][category] += 1

    def increase_category_count(self, category):
        self._category_counts[category] += 1

    def feature_category_count(self, feature, category):
        return float(self._feature_category_counts[feature][category])

    def feature_count(self, feature):
        return sum(self.feature_category_count(feature, c) for c in self.categories())

    def category_count(self, category):
        return float(self._category_counts[category])

    def total_count(self):
        return sum(self._category_counts.values())

    def categories(self):
        return self._category_counts.keys()

    def train(self, document, category):
        features = self.get_features(document)
        for f in features:
            self.increase_feature_category_count(f, category)
        self.increase_category_count(category)

    def probability_of_feature_given_category(self, feature, category):
        if self.category_count(category) == 0:
            return 0
        return self.feature_category_count(feature, category) / self.category_count(category)

    def weighted_probability_of_feature_given_category(self, feature, category, weight=1.0, assumed_probability=0.5):
        base_probability = self.probability_of_feature_given_category(feature, category)
        feature_count = self.feature_count(feature)
        return (weight*assumed_probability + feature_count*base_probability)/(weight + feature_count)

    def probability_of_category(self, category):
        return self.category_count(category) / self.total_count()



class NaiveBayesClassifier(BaseClassifier):

    def __init__(self, get_features):
        BaseClassifier.__init__(self, get_features)
        self._thresholds = defaultdict(lambda: 1.0)

    def set_threshold_for_category(self, category, threshold):
        self._thresholds[category] = threshold

    def threshold_for_category(self, category):
        return self._thresholds[category]

    def probability_of_document_given_category(self, document, category):
        features = self.get_features(document)
        feature_probabilities = (self.weighted_probability_of_feature_given_category(f, category) for f in features)
        return reduce(operator.mul, feature_probabilities, 1)

    def evidence_of_category_given_document(self, document, category):
        return self.probability_of_category(category) * self.probability_of_document_given_category(document, category)

    def evidences_of_categories_given_document(self, document):
        return {c: self.evidence_of_category_given_document(document, c) for c in self.categories()}

    def classify(self, document, default='UNKNOWN'):
        evidences = self.evidences_of_categories_given_document(document)
        return self.classify_from_evidences(evidences, default)

    def classify_from_evidences(self, evidences, default='UNKNOWN'):
        best_category, max_evidence = max(evidences.iteritems(), key=operator.itemgetter(1))
        threshold = self.threshold_for_category(best_category)

        # Check if threshold is violated
        if any(c != best_category and evidences[c]*threshold > max_evidence for c in self.categories()):
            return default

        return best_category

