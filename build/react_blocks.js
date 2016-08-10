// Let's create a "real-time search" component
(function($){

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var ProgramListing = React.createClass({displayName: "ProgramListing",

    getInitialState: function(){
        return { selectedItem: this.props.selectedItem, programs: undefined, windowWidth: window.innerWidth};
    },

    handleResize: function(e) {
        this.setState({windowWidth: window.innerWidth});
      },

    componentDidMount: function(){
        this.loadSubscriptionData();
        window.addEventListener('resize', this.handleResize);
    },

    columnCount: function(){
      if (this.state.windowWidth > 900) {
        return 4;
      }
      else if (this.state.windowWidth > 700) {
        return 3;
      }
      else if (this.state.windowWidth > 500) {
        return 2;
      }
      else if (this.state.windowWidth <= 500) {
        return 1;
      }
    },

    columnClasses: function(){
      return 'column-' + this.columnCount();
    },

    loadSubscriptionData: function(){
        var self = this;

        $.get( this.props.url, function( data ) {
            self.setState({
                programs: data
            });
        });
    },

    onItemClick: function (event) {
        if (event.currentTarget.dataset.id === this.state.selectedItem) {
          this.setState({ selectedItem: -1 });
        } else {
          this.setState({ selectedItem: event.currentTarget.dataset.id });
        }
    },

    render: function() {
        var programs = this.state.programs;
        if ( !programs ) {
            // Note that you can return false it you want nothing to be put in the dom
            // This is also your chance to render a spinner or something...
            return React.createElement("div", {className: "ajax-loader"})
        }

        // Gives you the opportunity to handle the case where the ajax request
        // completed but the result array is empty
        if ( programs.length === 0 ) {
            return React.createElement("div", null, "No result found.");
        }

        programSearch = programs.programs;
        if(this.props.search.length > 0 || this.props.filters !== undefined){
            var self = this;
            var searchString = '';
            if (this.props.search.length > 0) {
              // Create the regex search string if not empty
              search = this.props.search.trim().toLowerCase();
              searchArray = search.split(" ");
              for (var i = 0; i < searchArray.length; i++) {
                searchString += '(?=.*' + searchArray[i] + ')';
              }
            }
            if(this.props.filters !== undefined){
              // create the regex for filters if they exist
              var filters = this.props.filters;
              if (filters['area of study'] !== undefined) {
                var searchFilterAOS = '';
                for (var i = 0; i < filters['area of study'].length; i++) {
                  var re = '(?=.*\\b' + filters['area of study'][i].trim().toLowerCase() + '\\b)';
                  searchFilterAOS += re;
                }
              }
              if (filters['program type'] !== undefined) {
                var searchFilterPT = '';
                for (var i = 0; i < filters['program type'].length; i++) {
                  searchFilterPT += '(?=.*\\b' + filters['program type'][i].trim().toLowerCase() + '\\b)';
                }
              }
              // Now yhat we have created the regex for the filters, we need to determine which parts of the response we need to search
              if (filters['area of study'] !== undefined && filters['program type'] !== undefined) {
                  programSearch = programs.programs.filter(function(p){
                        var reAOS = new RegExp(searchFilterAOS);
                        var rePT = new RegExp(searchFilterPT);
                        var reSearch = new RegExp(searchString);
                        return p.program['area of study'].toLowerCase().match( reAOS ) && p.program['program type'].toLowerCase().match( rePT ) && (p.program['title'].toLowerCase().match( reSearch ) || p.program['body'].toLowerCase().match( reSearch ));
                  });                
              }
              else if (filters['area of study'] !== undefined && filters['program type'] === undefined) {
                  programSearch = programs.programs.filter(function(p){
                        var reAOS = new RegExp(searchFilterAOS);
                        var reSearch = new RegExp(searchString);
                        return p.program['area of study'].toLowerCase().match( reAOS ) && (p.program['title'].toLowerCase().match( reSearch ) || p.program['body'].toLowerCase().match( reSearch ));
                  });                
              }
              else if (filters['area of study'] === undefined && filters['program type'] !== undefined) {
                  programSearch = programs.programs.filter(function(p){
                        var rePT = new RegExp(searchFilterPT);
                        var reSearch = new RegExp(searchString);
                        return p.program['program type'].toLowerCase().match( rePT ) && (p.program['title'].toLowerCase().match( reSearch ) || p.program['body'].toLowerCase().match( reSearch ));
                  });                
              }
              else {
                // go ahead and always run search on change even if empty string
                programSearch = programs.programs.filter(function(p){
                      var reSearch = new RegExp(searchString);
                      return p.program['title'].toLowerCase().match( reSearch ) || p.program['body'].toLowerCase().match( reSearch );
                });
              }
            }
        }
        var ran = 'no';
        renderPrograms = [];
        var pLength = programSearch.length;

        for (var i = 0; i < programSearch.length; i++) {
          var programType = programSearch[i]['program']['program type'].split(', ');
          
          var programListingClasses = 'program-listing ' + this.columnClasses();
          if (i === parseInt(this.state.selectedItem)) {
            programListingClasses = programListingClasses + ' selected';
          }

          renderPrograms.push(
            React.createElement("div", {className: programListingClasses, key: i, onClick: this.onItemClick, "data-id": i}, React.createElement("h2", null, programSearch[i]['program']['title']), 
              React.createElement("ul", null, 
                programType.map(function(pt, key){
                  return React.createElement("li", {key: key}, pt)
                })
              ), 
              React.createElement("div", {className: "info"}, 
                "i"
              )
             )
          );
          if (((i+1) % this.columnCount()) === 0) {
            pLength++;
            if (parseInt(this.state.selectedItem) > -1 && parseInt(this.state.selectedItem) <= i && i <= (parseInt(this.state.selectedItem) + 3) && i >= (parseInt(this.state.selectedItem) - 3)) {
              var ran = 'yes';
              renderPrograms.push(React.createElement(ProgramDisplay, {key: pLength, i: i, selectedItem: this.state.selectedItem, programSearch: programSearch}));
            }
          }
          if (i === programSearch.length - 1 && ran == 'no') {
              if (parseInt(this.state.selectedItem) > -1) {
                renderPrograms.push(React.createElement(ProgramDisplay, {key: pLength, i: i, selectedItem: this.state.selectedItem, programSearch: programSearch}));
              }           
          }
        }

        return (
            React.createElement("div", {className: "program-listings"}, 
/*              <ReactCSSTransitionGroup transitionName="program-display" transitionAppear={true} transitionAppearTimeout={800} transitionEnterTimeout={800} transitionLeaveTimeout={800}>*/
                 renderPrograms
/*              </ReactCSSTransitionGroup>*/
            )
        );
    }
});

var ProgramDisplay = React.createClass({displayName: "ProgramDisplay",
    render: function() {
        var title = this.props.programSearch[this.props.selectedItem]['program']['title'];
        var image = this.props.programSearch[this.props.selectedItem]['program']['image']['src'];
        var imageMarkup = image ? React.createElement("div", {className: "pd-image"}, React.createElement("img", {src: image})) : '';
        var body = this.props.programSearch[this.props.selectedItem]['program']['body'];
        return (
            React.createElement("div", {className: "program-display active", "data-display-id": this.props.i}, 
              React.createElement("h2", {className: "pd-title"}, 
                title
              ), 
              imageMarkup, 
              React.createElement("div", {className: "pd-body"}, 
                body
              )
            )
        );
    }
});

var ProgramFilter = React.createClass({displayName: "ProgramFilter",
    getInitialState: function(){
        return { activeTab: 0, search: '', selectedItem: -1, filters: {}};
    },

    updateSearch: function(event) {
      this.setState({search: event.target.value.substr(0, 20)});
      this.setState({selectedItem: -1});
    },

    setActiveTab: function(event){
      this.setState({activeTab: event.currentTarget.dataset.index});
    },

    filterDisplayClass: function(i){
      if (i == this.state.activeTab) {
        return 'active';
      }
      else {
        return 'inactive';
      }
    },

    filterChange: function(tab, input){
      // we need to set the filter state when a filter is changed. This will be determined by array keys
      var filterSearch = this.state.filters;
      if (filterTabs[tab] === 'UNDERGRAD/GRAD' || filterTabs[tab] === 'AREA OF STUDY') {
        if (filterSearch['area of study'] !== undefined) {
          var index = filterSearch['area of study'].indexOf(filters[tab][input]);
          if (index > -1) {
            filterSearch['area of study'].splice(index, 1);
          } else {
            filterSearch['area of study'].push(filters[tab][input]);
          }
        }
        else {
          var arr = [];
          arr.push(filters[tab][input]);
          filterSearch["area of study"] = arr;
        }
      }
      if (filterTabs[tab] === 'PROGRAM TYPE') {
        if (filterSearch['program type'] !== undefined) {
          var index = filterSearch['program type'].indexOf(filters[tab][input]);
          if (index > -1) {
            filterSearch['program type'].splice(index, 1);
          } else {
            filterSearch['program type'].push(filters[tab][input]);
          }
        }
        else {
          var arr = [];
          arr.push(filters[tab][input]);
          filterSearch["program type"] = arr;
        }
      }
      this.setState({filters: filterSearch});
    },

    currentFilters: function(){
      var currentFilters = [];
      for (var k in this.state.filters) {
        for (var key in this.state.filters[k]) {
          currentFilters.push(this.state.filters[k][key]);
        }
      }
      return currentFilters;
    },
    
    render: function() {
        var self = this;
        var filterTabsMap = filterTabs.map(function(tab, i){
          if (i == self.state.activeTab) {
            return React.createElement("a", {className: "active", key: i, "data-index": i, onClick: self.setActiveTab}, tab)
          } else {
            return React.createElement("a", {href: "#", key: i, "data-index": i, onClick: self.setActiveTab}, tab)
          }
        });
        var filterDisplay = filterTabs.map(function(tab, i){
          return  React.createElement("div", {key: i, "data-index": i, className: self.filterDisplayClass(i)}, 
                    filters[i].map(function(filter, k){
                    return  React.createElement("div", {key: k, className: "filter-col"}, 
                              React.createElement("input", {filter: i, type: "checkbox", value: filter, onChange: self.filterChange.bind(null, i, k)}), 
                              React.createElement("label", null, filter)
                            )
                    })
                  )
        });

        var currentFilters = this.currentFilters();
        if (currentFilters.length > 0) {
          currentFilters = currentFilters.map(function(filter, i){
            return  React.createElement("div", {key: i, className: "current-filters"}, 
                      filter
                    )
          });
        }
        else {
          currentFilters = React.createElement("div", {className: "current-filters"}, 
                                    "All"
                                  )
        }

        return (
            React.createElement("div", {className: "program-filter"}, 
              React.createElement("div", {className: "program-filter-tabs"}, 
                filterTabsMap, 
                React.createElement("div", {className: "degree-search"}, 
                  React.createElement("input", {type: "text", value: this.state.search, onChange: this.updateSearch, placeholder: "Search Degrees"})
                )
              ), 
              React.createElement("div", {className: "program-filter-filter"}, 
                filterDisplay
              ), 
              React.createElement("div", {className: "filtered-by"}, 
                "Filtered by: ", currentFilters
              ), 

              React.createElement(ProgramListing, {url: "/salve-resources/degree-finder", filters: this.state.filters, search: this.state.search, selectedItem: this.state.selectedItem})

            )
        );
    }
});

var filters = [
    ["Undergraduate","Graduate"],
    ["Major","Minor", "Continuing Education Certificate", "Degree", "Certificate"],
    [
      "Administration of justice",
      "American studies",
      "Art and art history",
      "Biology and biomedical sciences",
      "Business studies and economics",
      "Chemistry",
      "Cultural and historic preservation",
      "Cultural, environmental and global studies",
      "Education",
      "English and communications",
      "History",
      "Holistic studies",
      "Humanities ",
      "Mathematical sciences",
      "Modern and classical languages",
      "Music, theatre and dance",
      "Nursing",
      "Philosophy",
      "Political science and international relations",
      "Psychology",
      "Rehabilitation counseling",
      "Religious and theological studies",
      "Social work",
    ],
];

var filterTabs = [
  "UNDERGRAD/GRAD",
  "PROGRAM TYPE",
  "AREA OF STUDY"
];

// Render the SearchExample component on the page

ReactDOM.render(
    React.createElement(ProgramFilter, null),
    document.getElementById('recent-comments')
);

})(jQuery);