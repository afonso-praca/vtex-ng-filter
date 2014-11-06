/*! vtex-ng-filter - v0.3.1 - 2014-11-06 */
(function() {
  var config, moreOptionsShowFilters, openFilters,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  config = {
    path: ''
  };

  openFilters = {};

  moreOptionsShowFilters = {};

  angular.module('vtexNgFilter', ["ui.bootstrap.accordion"]).factory("Filter", function($filter) {
    var Filter;
    return Filter = (function() {
      function Filter(filter) {
        this.update = __bind(this.update, this);
        this.clearSelection = __bind(this.clearSelection, this);
        this.getSelectedItemsURL = __bind(this.getSelectedItemsURL, this);
        this.getSelectedItems = __bind(this.getSelectedItems, this);
        this.setSelectedItems = __bind(this.setSelectedItems, this);
        this.updateSelectedCount = __bind(this.updateSelectedCount, this);
        var item, k, v, _i, _len, _ref;
        for (k in filter) {
          v = filter[k];
          this[k] = v;
        }
        this.selectedCount = 0;
        _ref = this.items;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          if ((item.url == null) && this.type !== 'date') {
            item.url = item.name;
          }
        }
        if (this.type === 'date') {
          this.dateObjectCache = {};
          this.date = {};
          this.today = moment().endOf('day').toDate();
          this.setDates = (function(_this) {
            return function(offsetFrom, offsetTo) {
              var date;
              if (offsetFrom == null) {
                offsetFrom = 0;
              }
              if (offsetTo == null) {
                offsetTo = 0;
              }
              date = {
                from: moment().add('d', offsetFrom).startOf('day').toDate(),
                to: moment().add('d', offsetTo).endOf('day').toDate()
              };
              return _this.date = date;
            };
          })(this);
          this.dateRangeLabel = (function(_this) {
            return function() {
              if (_this.date.from && _this.date.to) {
                if (moment(_this.date.from).startOf('day').isSame(moment().startOf('day'))) {
                  return $filter("translate")('listing.dates.today');
                } else if (moment(_this.date.from).isSame(moment().add('d', -1).startOf('day')) && moment(_this.date.to).isSame(moment().add('d', -1).endOf('day'))) {
                  return $filter("translate")('listing.dates.yesterday');
                } else if (moment(_this.date.to).startOf('day').isSame(moment().startOf('day'))) {
                  return "" + (moment(_this.date.from).add('hours', moment().hours()).fromNow()) + " " + ($filter("translate")('listing.dates.untilToday'));
                } else {
                  return "" + (moment(_this.date.from).add('hours', moment().hours()).fromNow()) + " " + ($filter("translate")('listing.dates.until')) + " " + (moment(_this.date.to).add('hours', moment().hours()).fromNow());
                }
              } else {
                return $filter("translate")('listing.dates.noRangeSelected');
              }
            };
          })(this);
        }
        this.updateSelectedCount();
      }

      Filter.prototype.updateSelectedCount = function() {
        var i, item, lastSelectedItemIndex, selectedItemIndex, _i, _j, _len, _len1, _ref, _ref1;
        if (this.type === 'date') {
          this.selectedCount = this.date.from && this.date.to ? 1 : 0;
        } else if (this.type === 'multiple') {
          _ref = this.items;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            item = _ref[i];
            if (item.selected) {
              lastSelectedItemIndex = i;
            }
          }
          if (lastSelectedItemIndex > 4) {
            moreOptionsShowFilters[this.rangeUrlTemplate] = true;
          }
          this.selectedCount = (_.filter(this.items, function(i) {
            return i.selected;
          })).length;
        } else if (this.type === 'single') {
          _ref1 = this.items;
          for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
            item = _ref1[i];
            if (item === this.selectedItem) {
              selectedItemIndex = i;
            }
          }
          if (selectedItemIndex > 4) {
            moreOptionsShowFilters[this.rangeUrlTemplate] = true;
          }
          this.selectedCount = this.selectedItem ? 1 : 0;
        }
        if (this.selectedCount > 0) {
          openFilters[this.rangeUrlTemplate] = true;
        }
        return this.selectedCountLabel = this.selectedCount ? "(" + this.selectedCount + ")" : "";
      };

      Filter.prototype.setSelectedItems = function(itemsAsSearchParameter) {
        var date, item, items, _i, _len, _ref, _ref1;
        if (this.type === 'date') {
          items = itemsAsSearchParameter.replace('[', '').replace(']', '').split(' TO ');
          date = {
            from: new Date(items[0]),
            to: new Date(items[1])
          };
          this.date = date;
        } else if (this.type === 'multiple') {
          _ref = this.items;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            item.selected = (_ref1 = item.url, __indexOf.call(itemsAsSearchParameter.split(','), _ref1) >= 0);
          }
        } else if (this.type === 'single') {
          this.selectedItem = _.find(this.items, function(i) {
            return i.url === itemsAsSearchParameter;
          });
        }
        return this.updateSelectedCount();
      };

      Filter.prototype.getSelectedItems = function() {
        var item, url, _base, _i, _len, _ref, _results;
        if (this.type === 'date') {
          if (this.date.from && this.date.to) {
            url = "[" + (moment(this.date.from).startOf('day').toISOString()) + " TO " + (moment(this.date.to).endOf('day').toISOString()) + "]";
            (_base = this.dateObjectCache)[url] || (_base[url] = {
              name: this.dateRangeLabel(),
              url: url
            });
            return [this.dateObjectCache[url]];
          } else {
            return [];
          }
        } else if (this.type === 'multiple') {
          _ref = this.items;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            if (item.selected) {
              _results.push(item);
            }
          }
          return _results;
        } else if (this.type === 'single') {
          if (this.selectedItem) {
            return [this.selectedItem];
          } else {
            return [];
          }
        }
      };

      Filter.prototype.getSelectedItemsURL = function() {
        var selectedArray;
        selectedArray = _.map(this.getSelectedItems(), function(i) {
          return i.url;
        });
        if (selectedArray.length > 0) {
          return selectedArray.join(',');
        } else {
          return null;
        }
      };

      Filter.prototype.clearItem = function(itemObject) {
        var item, _i, _len, _ref, _ref1;
        if ((_ref = this.type) === 'date' || _ref === 'single') {
          return this.clearSelection();
        } else if (this.type === 'multiple') {
          _ref1 = this.items;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            item = _ref1[_i];
            if (itemObject.url === item.url) {
              item.selected = false;
            }
          }
          return this.updateSelectedCount();
        }
      };

      Filter.prototype.clearSelection = function() {
        var item, _i, _len, _ref;
        if (this.type === 'date') {
          this.date = {};
        } else if (this.type === 'multiple') {
          _ref = this.items;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            item = _ref[_i];
            item.selected = false;
          }
        } else if (this.type === 'single') {
          this.selectedItem = null;
        }
        return this.updateSelectedCount();
      };

      Filter.prototype.update = function(filterJSON) {
        var item, updatedItem, _i, _len, _ref, _ref1, _results;
        if (filterJSON == null) {
          filterJSON = this;
        }
        _ref = this.items;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          updatedItem = _.find(filterJSON.items, function(i) {
            return i.name === item.name;
          });
          if (updatedItem && ((_ref1 = this.getSelectedItems()) != null ? _ref1.length : void 0) === 0) {
            _results.push(item.quantity = updatedItem.quantity);
          } else {
            _results.push(item.quantity = 0);
          }
        }
        return _results;
      };

      return Filter;

    })();
  }).directive("vtFilter", function($location) {
    return {
      restrict: 'E',
      scope: {
        filters: '=filters'
      },
      templateUrl: config.path ? config.path + '/vtex-ng-filter.html' : 'vtex-ng-filter.html',
      link: function($scope) {
        var filter, filters, updateFiltersOnLocationSearch, _i, _len;
        filters = $scope.filters;
        for (_i = 0, _len = filters.length; _i < _len; _i++) {
          filter = filters[_i];
          if (!openFilters.hasOwnProperty(filter.rangeUrlTemplate)) {
            openFilters[filter.rangeUrlTemplate] = false;
          }
          if (!moreOptionsShowFilters.hasOwnProperty(filter.rangeUrlTemplate)) {
            moreOptionsShowFilters[filter.rangeUrlTemplate] = false;
          }
        }
        $scope.openFilters = openFilters;
        $scope.moreOptionsShowFilters = moreOptionsShowFilters;
        $scope.clearAll = function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = filters.length; _j < _len1; _j++) {
            filter = filters[_j];
            _results.push(filter.clearSelection());
          }
          return _results;
        };
        filters.getAppliedFilters = function() {
          return _.filter(filters, function(f) {
            return f.getSelectedItems().length > 0;
          });
        };
        filters.getAppliedItems = function() {
          return _.chain(filters.getAppliedFilters()).map(function(f) {
            return f.getSelectedItems();
          }).flatten().value();
        };
        updateFiltersOnLocationSearch = function() {
          var searchQuery, _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = filters.length; _j < _len1; _j++) {
            filter = filters[_j];
            searchQuery = $location.search()[filter.rangeUrlTemplate];
            if (searchQuery) {
              filter.setSelectedItems(searchQuery);
              _results.push(filter.update());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
        updateFiltersOnLocationSearch();
        $scope.$on('$locationChangeSuccess', function() {
          var queryFilters, selectedFilters;
          queryFilters = (_.map(filters, function(f) {
            return $location.search()[f.rangeUrlTemplate];
          })).join();
          selectedFilters = (_.map(filters, function(f) {
            return f.getSelectedItemsURL();
          })).join();
          if (queryFilters === selectedFilters) {
            return;
          }
          return updateFiltersOnLocationSearch();
        });
        return _.each(filters, function(filter, i) {
          return $scope.$watch((function(scope) {
            return scope.filters[i].getSelectedItemsURL();
          }), function(newValue, oldValue) {
            var _j, _len1;
            if (newValue === oldValue) {
              return;
            }
            for (_j = 0, _len1 = filters.length; _j < _len1; _j++) {
              filter = filters[_j];
              $location.search(filter.rangeUrlTemplate, filter.getSelectedItemsURL());
            }
            return $location.search('page', 1);
          });
        });
      }
    };
  }).directive("vtFilterSummary", function() {
    return {
      restrict: 'E',
      scope: {
        filters: '=filters'
      },
      templateUrl: config.path ? config.path + '/vtex-ng-filter-summary.html' : 'vtex-ng-filter-summary.html'
    };
  }).directive("vtFilterButton", function() {
    return {
      restrict: 'E',
      scope: {
        filters: '=filters',
        openFilters: '&'
      },
      templateUrl: config.path ? config.path + '/vtex-ng-filter-button.html' : 'vtex-ng-filter-button.html',
      link: function($scope) {}
    };
  }).provider('vtexNgFilter', {
    config: config,
    $get: function(filter) {
      return filter;
    }
  });

}).call(this);

angular.module("vtexNgFilter").run(function($templateCache) {   'use strict';

  $templateCache.put('vtex-ng-filter-button.html',
    "<div class=\"filter-btn-container\"><button type=\"button\" class=\"btn btn-default filter-inner-btn btn-lg pull-left\"><i class=\"fa fa-filter filter-icon\" ng-class=\"{ 'enabled': filters.getAppliedItems().length > 0 }\"></i> <span translate=\"\">filters.filters</span> <span class=\"badge badge-corner badge-count\" ng-show=\"filters.getAppliedItems().length > 0\">{{ filters.getAppliedItems().length }}</span></button></div>"
  );


  $templateCache.put('vtex-ng-filter-summary.html',
    "<div class=\"filters-summary\"><span ng-show=\"filters.length > 0\" ng-repeat=\"filter in filters.getAppliedFilters()\"><span ng-repeat=\"item in filter.getSelectedItems()\"><span class=\"label label-primary\"><span>{{ item.name }}</span> <a ng-click=\"filter.clearItem(item)\"><i class=\"fa fa-times-circle fa-sm\"></i></a></span>&nbsp;</span></span></div>"
  );


  $templateCache.put('vtex-ng-filter.html',
    "<div class=\"filters-block\"><h3><span translate=\"\">listing.filters</span> <button translate=\"\" class=\"btn btn-clean-filters btn-default btn-sm\" ng-click=\"clearAll()\">listing.clearAll</button></h3><accordion close-others=\"true\"><accordion-group is-open=\"openFilters[filter.rangeUrlTemplate]\" heading=\"{{ 'filters.' + filter.rangeUrlTemplate | translate }} {{ filter.selectedCountLabel }}\" ng-repeat=\"filter in filters\"><div ng-switch=\"\" on=\"filter.type\"><div ng-switch-when=\"date\"><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates()\" translate=\"\">listing.dates.today</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-1, -1)\" translate=\"\">listing.dates.yesterday</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-7)\" translate=\"\">listing.dates.thisWeek</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.setDates(-30)\" translate=\"\">listing.dates.thisMonth</a></p><p><a href=\"javascript: void(0)\" ng-click=\"filter.clearSelection()\" translate=\"\">listing.dates.clearFilter</a></p><div class=\"input-append\"><input type=\"text\" ng-click=\"openFilters[filter.rangeUrlTemplate + 'Selector'] = !openFilters[filter.rangeUrlTemplate + 'Selector']\" value=\"{{filter.dateRangeLabel()}}\" readonly class=\"form-control\"><a href=\"javascript:void(0);\" class=\"add-on\" ng-click=\"openFilters[filter.rangeUrlTemplate + 'Selector'] = !openFilters[filter.rangeUrlTemplate + 'Selector']\"><i class=\"icon-calendar\"></i></a></div><div class=\"date-selectors\" ng-show=\"openFilters[filter.rangeUrlTemplate + 'Selector']\"><div class=\"controls\"><p translate=\"\">listing.dates.from</p><div class=\"well pull-left well-sm\" ng-model=\"filter.date.from\"><datepicker show-weeks=\"false\" max=\"filter.date.to ? filter.date.to : filter.today\"></datepicker></div></div><div class=\"controls\"><p translate=\"\">listing.dates.to</p><div class=\"well pull-left well-sm\" ng-model=\"filter.date.to\"><datepicker show-weeks=\"false\" min=\"filter.date.from\" max=\"filter.today\"></datepicker></div></div></div></div><div ng-switch-default=\"\"><ul class=\"filter-list nav nav-pills nav-stacked\"><!-- If 5 items, show all 5.\n" +
    "                 If 6 items, show all 6.\n" +
    "                 If 7 items, show 5 and button to show more. --><li ng-repeat=\"item in filter.items\" ng-show=\"(filter.items.length <= 6) || ($index < 5) || moreOptionsShowFilters[filter.rangeUrlTemplate]\"><label class=\"checkbox\" ng-if=\"filter.type == 'multiple'\"><input type=\"checkbox\" name=\"{{ filter.name }}\" ng-model=\"item.selected\" ng-change=\"filter.updateSelectedCount()\"><span class=\"filter-list-item type-multiple\">{{ item.name }} {{ item.quantity ? '(' + item.quantity + ')' : '' }}</span></label><label class=\"checkbox\" ng-if=\"filter.type ==  'single'\"><input type=\"radio\" name=\"{{ filter.name }}\" ng-model=\"filter.selectedItem\" ng-value=\"item\"><span class=\"filter-list-item type-single\">{{ item.name }} {{ item.quantity ? '(' + item.quantity + ')' : '' }}</span></label></li></ul><a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = true\" ng-show=\"filter.items.length > 6 &amp;&amp; !moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"text-muted\">{{ 'filters.moreOptionsShow' | translate}} ({{ filter.items.length }})</a> <a href=\"javascript:void(0)\" ng-click=\"moreOptionsShowFilters[filter.rangeUrlTemplate] = false\" ng-show=\"filter.items.length > 6 &amp;&amp; moreOptionsShowFilters[filter.rangeUrlTemplate]\" class=\"text-muted\">{{ 'filters.moreOptionsHide' | translate}}</a> <button translate=\"\" class=\"btn btn-default\" ng-click=\"filter.clearSelection()\" ng-show=\"filter.type === 'single' &amp;&amp; filter.selectedItem\">search.clear</button></div></div></accordion-group></accordion></div>"
  );
 });