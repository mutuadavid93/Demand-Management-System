<!-- 
    dropdownList.js File
-->

<style type="text/css">
 #sideNavBox {DISPLAY: none}
 #contentBox {MARGIN-LEFT: 20px}
 
 #suiteBar *, #s4-ribbonrow * 
{
    -webkit-box-sizing: initial;
    -moz-box-sizing: initial;
    box-sizing:content-box;
}

input[type="text"]{ line-height: 28px; }
</style>
  
<script>  
  
    $(document).ready(function () {  
        
        jQuery('#submitRequest').click(function(e) {
            e.preventDefault();
            updateTradeOff(); // invoke the func
        });
        
         // Query for the Current User Projects
        var queryCurUserProjList = function() {
            var curUserID =  _spPageContextInfo.userId;  

            //console.log(curUserID);
            // Make the REST call now
            //var url = "/_api/web/lists/getbytitle('User Information List')/items("+curUserID+")?$select=Title";
            var url = "/_api/Web/Lists/getByTitle('Demand')/Items?$select=ID,Created,StartDate,RequestStatus,\n\
Prioritization,TradeOff,Title&$filter=AuthorId eq "+ curUserID;

            // alert("We are in fetchingrecords() record "+id);
            var links_url = _spPageContextInfo.webAbsoluteUrl + url
            var links_headers = { "accept": "application/json;odata=verbose" };
            var callback = function (data) {

                function properDate(myDates) {
                    var adate = new Date(myDates);
                    var dd = adate.getDate();
                    var mm = adate.getMonth() + 1; //January is 0!
                    var yyyy = adate.getFullYear();

                    if (dd < 10) {
                        dd = '0' + dd
                    }
                    if (mm < 10) {
                        mm = '0' + mm
                    } adate = mm + '/' + dd + '/' + yyyy;
                    return adate;
                } // properDate()
                
                var $trs = "";
                $.each(data.d.results, function (index, item) {
                    //console.log(item);
                    var TradeOff = item.TradeOff;
                    if(TradeOff == "Yes"){
                        $trs += '<tr>'+
                                        '<td class="Proj">'+item.Title+'</td> <td class="CreatedDate">'+properDate(item.Created)+'</td>'+
                                        '<td class="StartDate">'+properDate(item.StartDate)+'</td> <td class="Prior">'+item.Prioritization+'</td>'+
                                        '<td class="Status">'+item.RequestStatus+'</td> '+
                                        '<td  class="Trade"><div class="form-group">'+
                                                '<select class="form-control" class="tradeOff">'+
                                                    '<option selected>'+TradeOff+'</option>'+
                                                    '<option>No</option>'+
                                                '</select>'+
                                            '</div></td>'+
                                        '<td class="itemID" style="display:none;">'+item.ID+'</td>'+
                                    '</tr>';
                    }
                    if(TradeOff == "No"){
                        $trs += '<tr>'+
                                        '<td class="Proj">'+item.Title+'</td> <td class="CreatedDate">'+properDate(item.Created)+'</td>'+
                                        '<td class="StartDate">'+properDate(item.StartDate)+'</td> <td class="Prior">'+item.Prioritization+'</td>'+
                                        '<td class="Status">'+item.RequestStatus+'</td> '+
                                        '<td  class="Trade"><div class="form-group">'+
                                                '<select class="form-control" class="tradeOff">'+
                                                    '<option selected>'+TradeOff+'</option>'+
                                                    '<option>Yes</option>'+
                                                '</select>'+
                                            '</div></td>'+
                                        '<td class="itemID" style="display:none;">'+item.ID+'</td>'+
                                    '</tr>';
                    }
                }); // Loop

                $('#userCurProjects').append($trs);

                }; // callback

                $.ajax({
                    type: 'GET',
                    headers: links_headers,
                    url: links_url,
                    success: callback,
                    error: function(){
                            console.log( "Failed to retrieve" );
                    }
                });    

        }(); //queryCurUserProjList()
        
        
        
        function updateTradeOff() {
            $('#userCurProjects tr').each(function (index, item) {
                var Project = $($(this).find('.Proj')).text();                                                                                                             
                //var CreatedDate = $($(this).find('.CreatedDate')).text(); 
                var Trade = $($(this).find('.Trade div select option:selected')).text(); 
                var Status = $($(this).find('.Status')).text(); 
                var Priority = $($(this).find('.Prior')).text(); 
                var StartDate = $($(this).find('.StartDate')).text(); 
                var itemID = $($(this).find('.itemID')).text(); 
                
                var call = $.ajax({
                    url:  _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('Demand')/Items('"+itemID+"')",
                    type: "POST",
                    data: JSON.stringify({
                        "__metadata" : {type : "SP.Data.DemandListItem"},
                        Title : Project,
                        RequestStatus : Status,
                        TradeOff : Trade,
                        Prioritization : Priority,
                        StartDate : StartDate
                    }),
                    headers: {
                      Accept: "application/json;odata=verbose",
                           "Content-Type": "application/json;odata=verbose",
                           "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(), 
                           "X-Http-Method" : "PATCH",
                           "IF-MATCH": "*"
                    }
                 });

               call.done(function(data, textStatus, jqXHR) {
                    console.log("Updates Effected");           
                });
                call.fail(function(jqXHR, textStatus, errorThrown) {
                    failHandler(jqXHR, textStatus, errorThrown);
                });
                
            }); // Loop

            function failHandler(jqXHR, textStatus, errorThrown){
                var resp = JSON.parse(jqXHR.responseText);
                var message = resp ? resp.error.message.value : textStatus;
                alert("Call failed on createListItem(). Error: "+message);
            }
        }; // updateTradeOff()
        
        
      });  // End Document Ready
      
      
    function countriesDrpDownBind(myList, myElemId, choiceElemId) {  
        var listName = myList;  
        var url = _spPageContextInfo.webAbsoluteUrl;  
  
        getListItems(listName, url, function (data) {  
            var items = data.d.results;  
             
            var inputElement = '<select id="'+choiceElemId+'" class="form-control"> <option  value="">Select</option>';  
               // Add all the new items  
            for (var i = 0; i < items.length; i++) {  
                 var itemId = items[i].Title,  
                   itemVal = items[i].Title;  
                 inputElement += '<option value="' + itemId + '"selected>' + itemId + '</option>';  
                
               }  
                inputElement += '</select>';  
                $('#'+myElemId).append(inputElement);  
  
              $("#"+choiceElemId).each(function () {  
                $('option', this).each(function () {  
  
                    if ($(this).text() == 'Select') {  
                        $(this).attr('selected', 'selected')  
                    };  
                });  
            });  
               // assign the change event to provide an alert of the selected option value  
              /*$('#drpcountries').on('change', function () {  
              alert($(this).val());  
                  });  */
             
          }, function (data) {  
            alert("Ooops, an error occured. Please try again");  
        });  
    }  
    // READ operation  
    // listName: The name of the list you want to get items from  
    // siteurl: The url of the site that the list is in.  
    // success: The function to execute if the call is sucesfull  
    // failure: The function to execute if the call fails  
    function getListItems(listName, siteurl, success, failure) {  
        $.ajax({  
            url: siteurl + "/_api/web/lists/getbytitle('" + listName + "')/items?$orderby=Title asc",  
            method: "GET",  
            headers: { "Accept": "application/json; odata=verbose" },  
            success: function (data) {  
                success(data);  
            },  
            error: function (data) {  
                failure(data);  
            }  
        });  
    }  
    
    var myElemId = "Priority";
    var choiceElemId = "Prioritization";
    var myList = "Prioritization";

    var optionElemId = "projPillars";
    var realElemId = "realProjectPillar";
    var aList = "Pillars";

    var optElemId = "BUnits";
    var rlElemId = "BusinessUnits";
    var aBList = "Departments";

    countriesDrpDownBind(aBList, rlElemId, optElemId);  
    countriesDrpDownBind(myList, myElemId, choiceElemId);  
    countriesDrpDownBind(aList, realElemId, optionElemId);  //invoke the Dynamic Function
</script>  