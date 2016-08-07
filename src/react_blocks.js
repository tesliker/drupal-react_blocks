// Let's create a "real-time search" component
(function($){

var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var ProgramListing = React.createClass({

    getInitialState: function(){
        return { selectedItem: this.props.selectedItem};
    },

    onItemClick: function (event) {

        this.setState({ selectedItem: event.currentTarget.dataset.id });

    },

    render: function() {
        programSearch = programs.programs;
        if(this.props.search.length > 0){
            var self = this;
            // We are searching. Filter the results.
            search = this.props.search.trim().toLowerCase();
            programSearch = programs.programs.filter(function(p){
                return p.program.title.toLowerCase().match( self.props.search );
            });
        }
        var ran = 'no';
        renderPrograms = [];
        var pLength = programSearch.length;

        for (var i = 0; i < programSearch.length; i++) {
          var programType = programSearch[i]['program']['program type'].split(', ');
          
          var programListingClasses = 'program-listing';
          if (i === parseInt(this.state.selectedItem)) {
            programListingClasses = programListingClasses + ' selected';
          }

          renderPrograms.push(
            <div className={programListingClasses} key={i} onClick={this.onItemClick} data-id={i}><h2>{programSearch[i]['program']['title']}</h2>
              <ul>
                {programType.map(function(pt, key){
                  return <li key={key}>{pt}</li>
                })}
              </ul>
              <div className="info">
                i
              </div>
             </div>
          );
          if (((i+1) % 4) === 0) {
            pLength++;
            if (parseInt(this.state.selectedItem) > -1 && parseInt(this.state.selectedItem) <= i && i <= (parseInt(this.state.selectedItem) + 3) && i >= (parseInt(this.state.selectedItem) - 3)) {
              var ran = 'yes';
              renderPrograms.push(<div key={pLength} className="program-display active" data-display-id={i}>{programSearch[this.state.selectedItem]['program']['title']}</div>);
            }
          }
          if (i === programSearch.length - 1 && ran == 'no') {
            if (renderPrograms[renderPrograms.length - 1]['props']['className'] === 'program-listing') {
              if (parseInt(this.state.selectedItem) > -1 && parseInt(this.state.selectedItem) <= i && i <= (parseInt(this.state.selectedItem) + 3) && i >= (parseInt(this.state.selectedItem) - 3)) {
                renderPrograms.push(<div key={pLength + 1} className="program-display active" data-display-id={i + 1}>{programSearch[this.state.selectedItem]['program']['title']}</div>);
              }
            }            
          }
        }

        return (
            <div className="program-listings">
              <ReactCSSTransitionGroup transitionName="slide" transitionAppear={true} transitionAppearTimeout={800} transitionEnterTimeout={500} transitionLeaveTimeout={500}>
                 {renderPrograms}
              </ReactCSSTransitionGroup>
            </div>
        );
    }
});

var ProgramFilter = React.createClass({
    getInitialState: function(){
        return { activeTab: 0, search: '', selectedItem: -1};
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
    
    render: function() {
        var self = this;
        var filterTabsMap = filterTabs.map(function(tab, i){
          if (i == self.state.activeTab) {
            return <a className="active" href="#" key={i} data-index={i} onClick={self.setActiveTab}>{tab}</a>
          } else {
            return <a href="#" key={i} data-index={i} onClick={self.setActiveTab}>{tab}</a>
          }
        });
        var filterDisplay = filterTabs.map(function(tab, i){
          return  <div key={i} data-index={i} className={self.filterDisplayClass(i)}>
                    {filters[i].map(function(filter, k){
                    return  <div key= {k} className="filter-col">
                              <input type="checkbox" value={filter} />
                              <label>{filter}</label>
                            </div>
                    })}
                  </div>
        });

        return (
            <div className="program-filter">
              <div className="program-filter-tabs">
                {filterTabsMap}
                <div className="degree-search">
                  <input type="text" value={this.state.search} onChange={this.updateSearch} placeholder="Search Degrees" />
                </div> 
              </div>
              <div className="program-filter-filter">
                {filterDisplay}
              </div>
              <div className="filtered-by">
                Filtered by: ALL
              </div>

              <ProgramListing search={this.state.search} selectedItem={this.state.selectedItem} />

            </div>
        );
    }
});

var filters = [
    ["Undergraduate","Graduate"],
    ["Bachelor's","Master's"],
    ["Business","English"],
];

var filterTabs = [
  "UNDERGRAD/GRAD",
  "PROGRAM TYPE",
  "AREA OF STUDY"
];

var programs = {
"programs": [
{
"program": {
"title": "Ph.D. in Humanities",
"area of study": "Humanities, Graduate Studies",
"program type": "                      Degree            "
}
},
{
"program": {
"title": "Nursing (RN-BSN)",
"area of study": "Continuing Education",
"program type": "                      Continuing Education Certificate            "
}
},
{
"program": {
"title": "Minor in Theatre Arts",
"area of study": "Music, Theatre and Dance, Undergraduate",
"program type": "                      Minor            "
}
},
{
"program": {
"title": "Minor in Studio Art",
"area of study": "Art and Art History, Undergraduate",
"program type": "                      Minor            "
}
},
{
"program": {
"title": "Minor in Sports Management",
"area of study": "Business Studies and Economics, Undergraduate",
"program type": "                      Minor            "
}
},
{
"program": {
"title": "Minor in Special Education",
"area of study": "Education, Undergraduate",
"program type": "                      Minor            "
}
},
{
"program": {
"title": "Minor in Spanish",
"area of study": "Modern and Classical Languages, Undergraduate",
"program type": "                      Minor            "
}
},
{
"program": {
"title": "Minor in Sociology and Anthropology",
"area of study": "Sociology and Anthropology, Undergraduate",
"program type": "                      Minor            "
}
},
{
"program": {
"title": "Minor in Secondary Education",
"area of study": "Education, Undergraduate",
"program type": "                      Minor            "
}
},
{
"program": {
"title": "Minor in Religious and Theological Studies",
"area of study": "Religious and Theological Studies, Undergraduate",
"program type": "                      Minor            "
}
}]};

// Render the SearchExample component on the page

ReactDOM.render(
    <ProgramFilter />,
    document.getElementById('recent-comments')
);

})(jQuery);