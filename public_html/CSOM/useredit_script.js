
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
  
  <!-- useredit_script.js -->
  
<script>  
  
    $(document).ready(function () {  
    
       SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function(){

            // useredit_script.js
            //
            // Retrieve the ID from the URL just after #tag
            var urlID = function () {
                 var realID = window.location.hash.slice(1);
                 return realID;
             }; // urlID

            jQuery('#submit_updates').click(function(e) {
                e.preventDefault();
                updateItems(urlID());
                //updateTradeOff();
            });

            // Retreieve the Edit Item Details
            var retreiveEditItem = function($itemID) {                    
                    function properDate(myDates) {
                        var adate = new Date(myDates),
                        dd = adate.getDate(),
                        mm = adate.getMonth() + 1,
                        yyyy = adate.getFullYear();

                        if (dd < 10) {dd = '0' + dd}
                        if (mm < 10) {
                            mm = '0' + mm
                        } adate = mm + '/' + dd + '/' + yyyy;
                        return adate;
                    } // properDate()

                    var links_url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('Demand')/items?$select=Ref_ID,ID,StartDate,Title,RequestStatus,Created,ProjectSponsor,ProjectOwner,Pillars,Prioritization,BusinessUnit&$top=1&$filter=ID eq "+$itemID;
                    var links_headers = { "accept": "application/json;odata=verbose" };
                    var callback = function (data) {

                    $.map(data.d.results, function (item, index) {

                        //console.log(item);

                        var Title = item.Title,
                            ProjectSponsor = item.ProjectSponsor,
                            ProjectOwner = item.ProjectOwner,
                            Pillars = item.Pillars,
                            Created = properDate(item.Created),
                            RequestStatus = item.RequestStatus,
                            BUnits = item.BusinessUnit,
                            StartDate = item.StartDate,
                            Reference_ID = item.Ref_ID,
                            Prioritization = item.Prioritization;

                        retrieveFileAttachments(Reference_ID); // invoke the Retrieve File Function

                        // Now Append the Values to HTML Markup
                        $('#inputProjTitle').val(Title);
                        $('#inputProjSponsor').val(ProjectSponsor);
                        $('#inputProjOwner').val(ProjectOwner);
                        //$('#inputStartDate').val(StartDate);
                        $('#projPillars option:selected').text(Pillars);
                        $('#Prioritization option:selected').text(Prioritization);
                        $('#BUnits option:selected').text(BUnits);
                        document.getElementById("inputStartDate").valueAsDate = new Date(StartDate);

                        $('#inputReference_ID').val(Reference_ID);
                        $('#requested_status span').text(RequestStatus);
                        $('#date_created span').text(Created);
                    }); // Loop

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

            }(urlID()); //retreiveEditItem()

            // Now Update the Item
            var updateItems = function($id) {  
                // alert("updateItems: "+$id);
            
                var proj = $('#inputProjTitle').val();
                var sponsor  = $('#inputProjSponsor').val();
                var owner = $('#inputProjOwner').val();
                //$('#inputStartDate').val(StartDate);
                var pillar = $('#projPillars option:selected').text();
                var priority  = $('#Prioritization option:selected').text();
                var bunit = $('#BUnits option:selected').text();
                //document.getElementById("inputStartDate").valueAsDate = new Date(StartDate);
                var date_start = $('#inputStartDate').val();
                var RefID = $('#inputReference_ID').val();
                // var req_status = $('#requested_status span').text();
                var req_status = "User Modified";
                var date_created = $('#date_created span').text();

                //alert("REf_ID "+RefID);
                // 
                //console.log(RefID);

                var call = $.ajax({
                    url:  _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('Demand')/Items('"+$id+"')",
                    type: "POST",
                    data: JSON.stringify({
                        "__metadata" : {type : "SP.Data.DemandListItem"},
                        Title: proj,
                        ProjectSponsor : sponsor,
                        ProjectOwner : owner,
                        Pillars : pillar,
                        Created : date_created,
                        RequestStatus : req_status,
                        BusinessUnit : bunit,
                        StartDate : date_start,
                        Prioritization : priority
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
                    /*var div = $('#messages');
                        div.html('<div class="alert alert-success alert-dismissible fade show" role="alert">'+
                            '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
                              '<span aria-hidden="true">&times;</span>'+
                            '</button>'+
                            '<strong>Item Updated Successfully!</strong>'+
                          '</div>'); */

                  uploadFileDocument(RefID);
                  updateTradeOff();
                });
                call.fail(function(jqXHR, textStatus, errorThrown) {
                    failHandler(jqXHR, textStatus, errorThrown);
                });

                function failHandler(jqXHR, textStatus, errorThrown){
                    var resp = JSON.parse(jqXHR.responseText);
                    var message = resp ? resp.error.message.value : textStatus;
                    alert("Call failed on createListItem(). Error: "+message);
                }             
            }; // updateItems()



            /*
            *
            * // Update the Document File
            *
            */

            function uploadFileDocument(ItemRef_ID) {  
                if(!window.FileReader){
                    alert("HTM5 File API not Support in this Browser");
                    return;
                }
                
                // Show the Spinner
                $('#submit_updates').replaceWith('<i class="fa fa-spinner fa-pulse fa-2x fa-fw"></i>&nbsp;<span class="text-success">Relax...Working on it.</span>');

                var context = SP.ClientContext.get_current();
                var web = context.get_web();
                var list = web.get_lists().getByTitle("FilesStore");

                var element = document.getElementById('attachURS');
                var file = element.files[0];
                var parts = element.value.split("\\");
                var fileName = parts[parts.length - 1];

                var reader = new FileReader();
                reader.onload = function (e) {
                   success1(e.target.result, fileName); 
                }
                reader.error = function (e) {
                   success1(e.target.error); 
                }
                reader.readAsArrayBuffer(file);


                function success1(buffer, fileName) {
                    // our filebuffer must be 64bit encoded
                    var bytes = new Uint8Array(buffer);
                    var content = new SP.Base64EncodedByteArray();
                    for(var b = 0; b < bytes.length; b++){
                        content.append(bytes[b]);
                    }

                    var fci = new SP.FileCreationInformation();
                    fci.set_content(content);
                    fci.set_overwrite(true);
                    fci.set_url(fileName);
                    var file = list.get_rootFolder().get_files().add(fci);

                    var item = file.get_listItemAllFields();
                    //item.set_item("Year", new Date().getFullYear());
                    item.set_item("Ref_ID", ItemRef_ID);
                    item.set_item("Employee", web.get_currentUser());
                    item.update();

                    context.executeQueryAsync(success2, fail);
                }//success1

                function success2() {
                    // var message = jQuery("#message");
                    // message.text("Document uploaded");
                    //alert("Document uploaded too");
                    //window.location.reload(true);
                    window.location.href = "https://safaricomo365.sharepoint.com/sites/pwa/Pages/User-Edit-View.aspx";
                }

                function fail(sender, args) {
                   alert("Attach the described file on 'URS File' Section to complete the update : "+args.get_message());
                }
            } // uploadDocument


            // Retrieve File from a Document Library:
            var retrieveFileAttachments = function($Ref_ID) {
                    var links_url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('FilesStore')/items?$select=File&$expand=File&$filter=Ref_ID eq %27"+$Ref_ID+"%27";
                    var links_headers = { "accept": "application/json;odata=verbose" };
                    var callback = function (data) {

                        $.map(data.d.results, function (item, index) {
                            var RealFileName = item.File.Name;
                            $('#curURSFile').html(": "+RealFileName);
                        }); // Loop

                    }; // callback

                    $.ajax({
                        type: 'GET',
                        headers: links_headers,
                        url: links_url,
                        success: callback,
                        error: function(){
                                console.log( "Failed to retrieve" );
                        }
                    }); //ajax                                                                                                                                                            
            }; // retrieveFile


            // Query for the Current User Projects
            var projList = function() {
                var curUserID =  _spPageContextInfo.userId;  

                console.log(curUserID);
                // Make the REST call now
                //var url = "/_api/web/lists/getbytitle('User Information List')/items("+curUserID+")?$select=Title";
                var url = "/_api/Web/Lists/getByTitle('Demand')/Items?$select=ID,Created,RequestStatus,\n\
Prioritization,TradeOff,StartDate,Title&$filter=AuthorId eq "+ curUserID;

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

                    var $trs = "<tbody>";
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
                    $trs += "</tbody>";

                    $('#projectsListed').append($trs);

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

            }(); //projList()
        
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
            
        
        function updateTradeOff() {
            //alert("Called updateTradeOff");
            $('#projectsListed tr:not(:first-child)').each(function (index, item) {
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

}); // SP.SOD.executeFunc
    
          
</script>  