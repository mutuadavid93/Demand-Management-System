<!DOCTYPE html>
<html>
    <head>
        <title>TODO supply a title</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="/sites/dev/SiteAssets/Resources/css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
    </head>
        
        <section class="container">
            <div class="row">                
                <div class="col-sm-6 col-sm-offset-3">
                    <button role="button"
                            class="btn btn-info" id="mybtn">Show Lists</button>

                    <button role="button"
                            class="btn btn-info" id="queyExpandBtn">Expand Fruits</button>

                    <button role="button"
                            class="btn btn-info" id="checkDataTypeB4POST">Check B4 POST</button>


                    <button role="button"
                            class="btn btn-info" id="createListItem">CreateListItem</button>

                </div>
            </div>
            
            <div class="row">   
                <div class="col-sm-6 col-sm-offset-3">
                    <button role="button"
                            class="btn btn-info" id="updateListItem">UpdateListItem</button>
                </div>
            </div>
            
            <div class="row">   
                <div class="col-sm-6 col-sm-offset-3">                    
                    <p class="lead" id="message"></p>
                </div>
            </div>
            
        </section>
        
        
        <script src="/sites/dev/SiteAssets/Resources/js/jquery.min.js" type="text/javascript"></script>
        <script src="/sites/dev/SiteAssets/Resources/js/bootstrap.min.js" type="text/javascript"></script>
        <script type="text/javascript">
            $(document).ready(function() {
/*
|   Working with REST and CSOM
|   NB: REST only support 6 requests
|
*/




/*
|   Use expand
|   When object we are querying has a collection property
|   @queries()
|
*/

jQuery('#mybtn').click(function(e) {
    e.preventDefault();
    queries(); // invoke the func
});
jQuery('#queyExpandBtn').click(function(e) {
    e.preventDefault();
    queryWIthExpandToList(); // invoke the func
});
jQuery('#checkDataTypeB4POST').click(function(e) {
    e.preventDefault();
    checkDataTypeB4POST(); // invoke the func
});
jQuery('#createListItem').click(function(e) {
    e.preventDefault();
    createListItem(); // invoke the func
});
jQuery('#updateListItem').click(function(e) {
    e.preventDefault();
    updateListItem(); // invoke the func
});
        
var queries = function() {
    var calls = jQuery.ajax({
       url: _spPageContextInfo.webAbsoluteUrl+"/_api/Web/?$select=Title,Lists/Title,Lists/Hidden,Lists/ItemCount&$expand=Lists",
       type: "GET",
       dataType: "json",
       headers: {
           Accept: "application/json;odata=verbose"
       }
    });
    
    calls.done(function(data, textStatus, jqXHR) {
        var message = jQuery("#message");
        message.text("Lists in " + data.d.Title + " Site are:");
        message.append("<br />");
        
        // iterate through results coll and determine whether lists are hidden
        // or not i.e value.Hidden ? "" : "not"
        jQuery.each(data.d.Lists.results, function(index, value) {
            message.append(String.format("List {0} has {1} items and is {2} hidden",
                value.Title, value.ItemCount, value.Hidden ? "" : "not"
            ));
            message.append("<br />");
        });
    });
    calls.fail(function(jqXHR, textStatus, errorThrown) {
        var rsponse = JSON.parse(jqXHR.responseText);
        var message = rsponse ? rsponse.error.message.value : textStatus;
        alert("Call failed on queries(). Error: "+message);
    });
}; // queries() end



/*
|  Query more than 1 list using and expand option [LookUpType]
|  @queryWIthExpandToList
|
|
*/ 
       
var queryWIthExpandToList = function() {
    var calls = jQuery.ajax({
       url: _spPageContextInfo.webAbsoluteUrl+"/_api/Web/Lists/getByTitle('Products')/Items?$select=Title,Category/Title&$filter=(Category/Title eq 'Fruits')&$expand=Category/Title",
       type: "GET",
       dataType: "json",
       headers: {
           Accept: "application/json;odata=verbose"
       }
    });
    
    calls.done(function(data, textStatus, jqXHR) {
        var message = jQuery("#message");
        message.text("Fruits: ");
        message.append("<br />");
        
        // iterate through results coll and determine whether lists are hidden
        // or not i.e value.Hidden ? "" : "not"
        jQuery.each(data.d.results, function(index, value) {
            message.append(value.Title+" category is "+value.Category.Title);
            message.append("<br />");
        });
    });
    calls.fail(function(jqXHR, textStatus, errorThrown) {
        var rsponse = JSON.parse(jqXHR.responseText);
        var message = rsponse ? rsponse.error.message.value : textStatus;
        alert("Call failed on queryWIthExpandToList(). Error: "+message);
    });
}; //queryWIthExpandToList()


/*
|  Check the type of __metadata type for the List b4 POST
|  @checkDataTypeB4POST()
|
|
*/ 

var checkDataTypeB4POST = function() {
    var call = $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('MyTaskListTest')/Items",
        type: "GET",
        dataType: "json",
        headers: {
            Accept: "application/json;odata=verbose"
        }
    });       
    call.done(function(data, textStatus, jqXHR) {
       var msg = jQuery("#message");
       msg.text(data.d.results.length);
    });
    call.fail(function(jqXHR, textStatus, errorThrown) {
       var response = JSON.parse(jqXHR.responseText);
       var message = response ? response.error.message.value : textStatus;
       alert("Call failed on createAList() Error: "+message);
    });
}; // checkDataTypeB4POST()


/*
|  Create a List Item and AssignedTo user
|  @createListItem()
|
|
*/

var createListItem = function() {
    var call = $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/?$select=Title, CurrentUser/Id&$expand=CurrentUser/Id",
        type: "GET",
        dataType: "json",
        headers: {
            Accept: "application/json;odata=verbose"
        }
    });
    call.done(function(data, textStatus, jqXHR) {
        var userId = data.d.CurrentUser.Id;
        addItem(userId);
    });
    call.fail(function(jqXHR, textStatus, errorThrown) {
        failHandler(jqXHR, textStatus, errorThrown);
    });
    
    function addItem(userId){
        var due = new Date();
        due.setDate(due.getDate()+7);
        
        var call = $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('MyTaskListTest')/Items",
            type: "POST",
            data: JSON.stringify({
                "__metadata" : {type:"SP.Data.MyTaskListTestListItem"},
                Title: "Lovely Task",
                AssignedToId: userId,
                PercentComplete: 0.64,
                DueDate: due
            }),
            headers: {
                Accept: "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $('#__REQUESTDIGEST').val()
            }
        });
        
        call.done(function(data, textStatus, jqXHR) {
            var div = $('#message');
            div.text("Task Item Successfully Added "+userId);
        });
        call.fail(function(jqXHR, textStatus, errorThrown) {
            failHandler(jqXHR, textStatus, errorThrown);
        });
    } //addItem()
    
    function failHandler(jqXHR, textStatus, errorThrown){
        var resp = JSON.parse(jqXHR.responseText);
        var message = resp ? resp.error.message.value : textStatus;
        alert("Call failed on createListItem(). Error: "+message);
    }
}; // createListItem()


/*
|  Updating a List item
|  @updateListItem()
|
|
*/

var updateListItem = function() {
    var call = $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('MyTaskListTest')/Items(2)",
            type: "POST",
            data: JSON.stringify({
                "__metadata" : {type:"SP.Data.MyTaskListTestListItem"},
                Title: "Updated Task",
                Status : "Pending",
                PercentComplete: 0.71
            }),
            headers: {
                Accept: "application/json;odata=verbose",
                "Content-Type": "application/json;odata=verbose",
                "X-RequestDigest": $('#__REQUESTDIGEST').val(),
                "X-Http-Method": "PATCH",
                "IF-MATCH": "*"
            }
        });
        call.done(function(data, textStatus, jqXHR) {
            var div = $('#message');
            div.text("Task Item Updated!!");
        });
        call.fail(function(jqXHR, textStatus, errorThrown) {
            var resp = JSON.parse(jqXHR.responseText);
            var message = resp ? resp.error.message.value : textStatus;
            alert("Call failed on createListItem(). Error: "+message);
        });
}; //updateListItem()

});
</script>
</html>