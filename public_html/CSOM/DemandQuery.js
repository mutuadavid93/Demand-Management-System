<!--
 DemandQuery.js is the name to this File
-->

<div class='container'>
    <div class='row'>
        <div class='col-xl-12'>
            <p id="messages"></p>
        </div>
    </div>
</div>


<script type='text/javascript'>
$(function() {

   SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function() {
       
        // Retrieve the ID from the URL just after #tag
        var urlID = function () {
             var realID = window.location.hash.slice(1);
             return realID;
         }; // urlID
         //console.log(urlID());


         // Handle The Modal Window
         // Fire the Modal on click of Add Btn
         $('#add_resource').on('click', function (event) {
             event.preventDefault();
             event.stopPropagation();

             $('#mymodal').modal({
                 show : true
             }); 
         }); // click #add_resource

         // Apend a skillset on add click inside modal window
         $('#addPopupBtn').on('click', function (event) {
             event.preventDefault();
             event.stopPropagation();

             var $skillset = $("#poperSkillsets option:selected").text(); 
             var $resource = $('#inputResource').val(); 
             
             if($resource != '' && $("#poperSkillsets").val() != ''){
                var $realResource = '<tr>'+
                                          '<td class="skillset_req">'+$skillset+'</td> <td class="resource_req">'+$resource+'</td>'+
                                      '</tr>';

                $('#skillSetsBodyDM').append($realResource);
                $('#mymodal').modal('hide'); // make modal disapear 
             }else{
                alert("Both skill set and resource fields should be filled out!");
             }
         });

         // Clear the Input Fields after closing the Modal
         $('#mymodal').on('hidden.bs.modal', function () {
             $(this).find("input,select").val('');
         });


        // ### Fecth Data from The List
         var fetchingrecords = function($itemID) {
                 // alert("We are in fetchingrecords() record "+id);
                 var links_url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('Demand')/items?$select=\n\
                        EmpID, ID,BusinessUnit,StartDate,Title,ProjectSponsor,ProjectOwner,Pillars,Prioritization,\n\
PreAnalysisComments,GeneralComments,RequestStatus,Ref_ID&$top=1&$filter=ID eq "+$itemID;
                 var links_headers = { "accept": "application/json;odata=verbose" };
                 var callback = function (data) {

                     $.map(data.d.results, function (item, index) {

                         //console.log(item);
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

                         var Title = item.Title,
                             ProjectSponsor = item.ProjectSponsor,
                             ProjectOwner = item.ProjectOwner,
                             Pillars = item.Pillars,
                             Reference_ID = item.Ref_ID,
                             EmpID = item.EmpID,
                             ID = item.ID,
                             BusinessUnit = item.BusinessUnit,
                             RequestStatus = item.RequestStatus,
                             GeneralComments = item.GeneralComments,
                             PreAnalysisComments = item.PreAnalysisComments,
                             StartDate = properDate(item.StartDate),
                             Prioritization = item.Prioritization;


                         // Now Append the Values to HTML Markup
                         $('#inputProjTitle').val(Title).attr('readonly', true);
                         $('#inputProjSponsor').val(ProjectSponsor).attr('readonly', true);
                         $('#inputProjOwner').val(ProjectOwner).attr('readonly', true);
                         $('#Pillars').val(Pillars).attr('readonly', true);
                         $('#Prioritize').val(Prioritization).attr('readonly', true);
                         $('#inputReference_ID').val(Reference_ID);
                         $('#Item_ID').val(ID);

                         $('#BUnits').val(BusinessUnit);
                         document.getElementById("inputStartDate").valueAsDate = new Date(StartDate);
                         
                         // Comments
                         $('#pre-analysis').val(PreAnalysisComments);
                         $('#general_comments').val(GeneralComments);
                         $('#requestStatus option:selected').text(RequestStatus);
                         $("#requestStatus option[value='"+RequestStatus+"']").remove(); // remove the extra option

                         //alert(Reference_ID);
                         retrieveFile(Reference_ID);
                         projLists(EmpID);
                         checkSkillsSets(Reference_ID);
                         getUserProfiles(ID);
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
         }(urlID()); //fetchingrecords()     


         // Retrieve the UserName from Current Session
         var getUserProfiles = function($itemID) {
            //alert($itemID);
            var links_url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Demand')/Items?$select=DemandManager/Title&$expand=DemandManager/Id&$filter=ID%20eq%20"+$itemID;
                 var links_headers = { "accept": "application/json;odata=verbose" };
                 var callback = function (data) {    
                    
                    console.log(data.d.results[0].DemandManager.Title);
                     //console.log(_spPageContextInfo.userId);
                     var demandMgrName = data.d.results[0].DemandManager.Title;
                     $('#dmand_mgr').val(demandMgrName).attr('readonly', true);

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
         }; //getUserProfiles()


     jQuery('#dmger_update').on('click', function(event) {
         event.preventDefault();
         updateUserId(urlID()); //invoke updateUserId()
         skillset($('#inputReference_ID').val());
     });

         var updateUserId = function($itemID) {
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
                 var $id = $itemID;
                 appoveNow($id, userId);
                 //console.log(data.d.AccountName);
             });
             call.fail(function(jqXHR, textStatus, errorThrown) {
                 failHandler(jqXHR, textStatus, errorThrown);
             });  

         // Updating a List Item DocumentsStatus
         function appoveNow($id, userIdentity) {

             var preAnalysis = $('#pre-analysis').val();
             var general_comments = $('#general_comments').val();
             var requestStatus = $('#requestStatus option:selected').text();
             var PreAnalyisStatus = $('#preanylysisStatus').text();

             //alert(PreAnalyisStatus);

             var call = $.ajax({
                 url:  _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('Demand')/Items('"+$id+"')",
                 type: "POST",
                 data: JSON.stringify({
                     "__metadata" : {type : "SP.Data.DemandListItem"},
                     PreAnalysisComments : preAnalysis,
                     GeneralComments : general_comments,
                     RequestStatus : requestStatus,
                     PreAnalysis_x0020_Status : PreAnalyisStatus,
                     DemandManagerId : userIdentity
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
                 var div = $('#messages');
                     div.html('<div class="alert alert-success alert-dismissible fade show" role="alert">'+
                         '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
                           '<span aria-hidden="true">&times;</span>'+
                         '</button>'+
                         '<strong>Item Updated Successfully!</strong>'+
                       '</div>');   
               
               // redirect
               window.location.href = "https://safaricomo365.sharepoint.com/sites/pwa/Pages/Ongoing-Demand-View.aspx";
             });
             call.fail(function(jqXHR, textStatus, errorThrown) {
                 failHandler(jqXHR, textStatus, errorThrown);
             });
         }; // approveNow()

         function failHandler(jqXHR, textStatus, errorThrown){
             var resp = JSON.parse(jqXHR.responseText);
             var message = resp ? resp.error.message.value : textStatus;
             alert("Call failed on createListItem(). Error: "+message);
         }

       }; // updateUserId()
       
       
       
       // Skillset TakeOn
       // We are Inserting into SkillSet List
        
        
         var skillset =function(Ref_Identity) {
                if ( $( "#skillSetsBodyDM" ).html() ) {
                    // Loop through trs in grid
                    $('#skillSetsBodyDM tr').each(function (index, item) {
                        var skill = $($(this).find('.skillset_req')).text();                                                                                                             
                        var resource = $($(this).find('.resource_req')).text();
                        var gridItemID = $($(this).find('.itemListID')).text();
                        
                        var listName = "SkillSets";
                        // Now Determine Whether to Update or Create items
                        if(gridItemID != ''){
                            // Update
                            var call = $.ajax({
                                url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('"+listName+"')/Items("+gridItemID+")",
                                type: "POST",
                                data: JSON.stringify({
                                    "__metadata" : {type:"SP.Data.SkillSetsListItem"},
                                    Title: skill,
                                    Ref_ID: Ref_Identity,
                                    Resource: resource
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
                                console.log("Updates effected on SkillsSets");
                            });
                            call.fail(function(jqXHR, textStatus, errorThrown) {
                                var resp = JSON.parse(jqXHR.responseText);
                                var message = resp ? resp.error.message.value : textStatus;
                                alert("Call failed on createListItem(). Error: "+message);
                            });
                        } // End Update If
                        
                        if(gridItemID == ''){
                            // Create
                            var invokation = $.ajax({
                                url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('"+listName+"')/Items",
                                type: "POST",
                                data: JSON.stringify({
                                    __metadata: {"type": "SP.Data.SkillSetsListItem"},
                                    Title: skill,
                                    Ref_ID: Ref_Identity,
                                    Resource: resource
                                }),
                                headers: {
                                    "accept": "application/json;odata=verbose",
                                    "content-Type": "application/json;odata=verbose",
                                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                                }
                            });

                            invokation.done(function (data, textStatus, jqXHR) {
                                //console.log("SkillSet Added Successfully");
                                window.location.href = "https://safaricomo365.sharepoint.com/sites/pwa/Pages/Ongoing-Demand-View.aspx";
                            });
                            invokation.fail(function (jqXHR, textStatus, errorThrown) {
                                failHandler(jqXHR, textStatus, errorThrown);
                            });
                        } // End Create If
                        
                        

                        
                    }); // End Loop

                     function failHandler(jqXHR, textStatus, errorThrown){
                        var resp = JSON.parse(jqXHR.responseText);
                        var message = resp ? resp.error.message.value : textStatus;
                        alert("Call failed on createListItem(). Error: "+message);
                    }
                }else{
                    alert("Kindly provide some skillsets.");
                }
         }; //skillset()   


         // Retrieve File from a Document Library:
         var retrieveFile = function($Ref_ID) {
                var listName = "FilesStore";
                 var links_url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('"+listName+"')/items?$select=File&$expand=File&$filter=Ref_ID eq %27"+$Ref_ID+"%27";
                 var links_headers = { "accept": "application/json;odata=verbose" };
                 var callback = function (data) {

                     $.map(data.d.results, function (item, index) {
                         var RealFileName = item.File.Name;
                         var fullURL = _spPageContextInfo.webAbsoluteUrl+"/_layouts/15/WopiFrame.aspx?sourcedoc="+_spPageContextInfo.webAbsoluteUrl+"/"+listName+"/"+RealFileName+"&action=default";
                         console.log(fullURL);
                         $('#attachURS').val(RealFileName);
                         
                         $('#fileIntel').append('<a href="'+fullURL+'" target="_blank"><i class="fa fa-file"></i> &nbsp;Open</a>');
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
            var projLists = function(curUserID) {
                //var curUserID =  _spPageContextInfo.userId;  

                console.log(curUserID);
                // Make the REST call now
                //var url = "/_api/web/lists/getbytitle('User Information List')/items("+curUserID+")?$select=Title";
                var url = "/_api/Web/Lists/getByTitle('Demand')/Items?$select=ID,Created,StartDate,RequestStatus,Prioritization,TradeOff,Title&$filter=AuthorId eq "+ curUserID;

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
                        console.log(item);
                        $trs += '<tr>'+
                                        '<td class="Proj">'+item.Title+'</td> <td class="CreatedDate">'+properDate(item.Created)+'</td>'+
                                        '<td class="StartDate">'+properDate(item.StartDate)+'</td> <td class="Prior">'+item.Prioritization+'</td>'+
                                        '<td class="Status">'+item.RequestStatus+'</td> '+
                                        '<td><label>'+item.TradeOff+'</label></td>'+
                                        '<td class="itemID" style="display:none;">'+item.ID+'</td>'+
                                    '</tr>';
                    }); // Loop
                    $trs += "</tbody>";

                    $('#projectLists').append($trs);

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

            }; //projLists()
            
            
            // Attach SkillSets
            
            function skillsDrpDownBind(myList, myElemId, choiceElemId) {  
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
    } // getListItems()
    
    var $list = "Skills";
    var $elem = "skillSet";
    var $opt = "poperSkillsets";
    skillsDrpDownBind($list, $elem, $opt); // invoke dropdown skillsets
            
   }); // SP.SOD.executeFunc()


    // Pre-Analysis Button Click
    function preAnalyseNow(){    
        var PreAnalysisSTatus = "Active";
        $('#preanylysisStatus').html(PreAnalysisSTatus);
        $('#preanylysis').html("<p class='text-success lead'>Pre-analysis comments will be sent to user when you click save</p>");
        // hide cancel btn
        $('#cancel_btn').css('display', 'none');
    } // preAnalyseNow()

$('#email_preanalysis').click(function(event) {
    event.preventDefault();
    preAnalyseNow();                                                                                                                                                                                                  
});


// Query for Skillsets
    var checkSkillsSets = function(Ref_IDentity) {
            var call = $.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('SkillSets')/Items?$select=ID,Title,Resource,Ref_ID&$filter=Ref_ID eq %27"+Ref_IDentity+"%27",
                type: "GET",
                dataType: "json",
                headers: {
                    Accept: "application/json;odata=verbose"
                }
            });       
            call.done(function(data, textStatus, jqXHR) {
                 for(var x=0; x<data.d.results.length; x++){
                     console.log(data.d.results[x]);
                 }
                 
                 var $trs = "<tbody id='skillSetsBodyDM'>";
                    $.each(data.d.results, function (index, item) {
                        console.log(item);
                        $trs += '<tr>'+
                                    '<td class="skillset_req">'+item.Title+'</td> <td class="resource_req">'+item.Resource+'</td>'+
                                    '<td class="itemListID" style="display:none;">'+item.ID+'</td>'+
                                '</tr>';
                    }); // Loop
                    $trs += "</tbody>";

                    $('#dman_mgr_skillsList').append($trs);
            });
            call.fail(function(jqXHR, textStatus, errorThrown) {
               var response = JSON.parse(jqXHR.responseText);
               var message = response ? response.error.message.value : textStatus;
               alert("Call failed on createAList() Error: "+message);
            });
        };// checkSkillsSets()


}); // End Document Ready
</script> 