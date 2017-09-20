

<div>
    <div id="message"></div>
</div>

<script
  src="https://code.jquery.com/jquery-2.2.4.min.js"
  integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
  crossorigin="anonymous"></script>
<script type="text/javascript">
/* 
    Created on : Sep 6, 2017, 8:44:02 AM
    Author     : David Mutua
*/

var queryFirst = function () {
    var invokation = $.ajax({
        url : _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/GetByTitle('DemandTasks')/Items",
        type: "GET",
        dataType: "json",
        headers: {
            Accept: "application/json;odata=verbose"
        }
    });
    
    invokation.done(function (data, textStatus, jqXHR) {
        var message = $("#message"); 
        message.text(data.d.results.length);
    });
    
    invokation.fail(function (jqXHR, textStatus, errorThrown) {
        var response = JSON.parse(jqXHR.responseText);
        var message = response ? response.error.message.value : textStatus;
        alert("Call failed on CreateItem() Error: "+ message);
    });
}();
</script>