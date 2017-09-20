

<div>
    <button id="CreateItem">Create Item</button>
</div>

<script
  src="https://code.jquery.com/jquery-2.2.4.min.js"
  integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
  crossorigin="anonymous"></script>

<script type="text/javascript">
$(function () {
    $("#CreateItem").on('click', function(e) {
        e.preventDefault();
        createItem();
    });
    
    // Get the Current Logged User.
    var createItem = function () {
      alert("We are inside CreateItem Func");
      var call = $.ajax({
          url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/?$select=Title, CurrentUser/Id&$expand=CurrentUser/Id",
          type: "GET",
          dataType: "json",
          headers: {
            "accept": "application/json;odata=verbose"
            }
      }); 
      
    call.done(function (data, textStatus, jqXHR) {
        var userID = data.d.CurrentUser.Id;
        addItem(userID);
    });
    
    call.fail(function (jqXHR, textStatus, errorThrown) {
          failHandler(jqXHR, textStatus, errorThrown);  
    });
    
    // Add item Declaration
        function addItem(userId) {
            alert("We are inside addItem Func "+userId);
            var invokation = $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('Demand')/Items",
                type: "POST",
                data: JSON.stringify({
                    __metadata: {"type": "SP.Data.DemandListItem"},
                    Title: "Sample Project Title",
                    ProjectSponsor: "Sponsor 47",
                    ProjectOwner: "Project Owner 47",
                    s2zc: userId,
                    Pillars: "Great Pillar",
                    Prioritization: "High Prioritization"
                }),
                headers: {
                    "accept": "application/json;odata=verbose",
                    "content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                }
            });
            
            invokation.done(function (data, textStatus, jqXHR) {
                alert("Item Added Successfully");
            });
            invokation.fail(function (jqXHR, textStatus, errorThrown) {
                failHandler(jqXHR, textStatus, errorThrown);
            });
        }// addItem()
        
        function failHandler(jqXHR, textStatus, errorThrown) {
            var respoonse = JSON.parse(jqXHR.responseText);
            var message = respoonse ? respoonse.error.message.value : textStatus;
            alert("Call failed. Error: "+message);
        }
        
    }; // createItem()
}); // Document ready
</script>