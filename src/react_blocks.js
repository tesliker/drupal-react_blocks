// Let's create a "real-time search" component
(function($){

var SearchExample = React.createClass({

    loadSubscriptionData: function(){
        var self = this;

        this.setState({response: undefined});
        console.log(this.props.url);
        $.get( this.props.url, function( data ) {
            self.setState({
                response: data
            });
        });
    },

    getInitialState: function(){
        return { searchString: '', response: undefined };
    },

    componentDidMount: function(){
        this.loadSubscriptionData();
    },

    handleChange: function(e){
        // If you comment out this line, the text box will not change its value.
        // This is because in React, an input cannot change independently of the value
        // that was assigned to it. In our case this is this.state.searchString.
        this.setState({searchString:e.target.value});
    },

    render: function() {

        if ( !this.state.response ) {
            // Note that you can return false it you want nothing to be put in the dom
            // This is also your chance to render a spinner or something...
            return <div>The responsive it not here yet!</div>
        }

        // Gives you the opportunity to handle the case where the ajax request
        // completed but the result array is empty
        if ( this.state.response.length === 0 ) {
            return <div>No result found for this subscription</div>;
        }

        console.log(this.state.response);

        var libraries = this.state.response.data.nodeQuery,

        // var libraries = this.props.items,
            searchString = this.state.searchString.trim().toLowerCase();


        if(searchString.length > 0){

            // We are searching. Filter the results.

            libraries = libraries.filter(function(l){
                return l.uid.entity.name.toLowerCase().match( searchString );
            });

        }

        return <div>
            <input type="text" value={this.state.searchString} onChange={this.handleChange} placeholder="Type here" />

            <ul>

                { libraries.map(function(l){
                    return <li>{l.title} <a href={'/user/' + l.uid.entity.uid}>{l.uid.entity.name}</a></li>
                }) }

            </ul>

        </div>;

    }
});


var libraries = [];

// Render the SearchExample component on the page

ReactDOM.render(
    <SearchExample items={ libraries } url="http://salve:salvedev@degree-finder-7107693.salve.devops.ourdrop.com/salve-resources/degree-finder" />,
    document.getElementById('recent-comments')
);

})(jQuery);