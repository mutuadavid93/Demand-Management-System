<script type='text/javascript'>
$(function () {
// DemandFile.js File
// 
    // Retrieve the ID from the URL just after #tag
    var urlID = function () {
         var realID = window.location.hash.slice(1);
         return realID;
     }; // urlID
    
    // ### Fecth Data from The List
    var fetchingrecords = function($itemID) {
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
    
            // alert("We are in fetchingrecords() record "+id);
            var links_url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('Demand')/items?$select=EmpID,BusinessUnit,StartDate,ID,Title,ProjectSponsor,RequestStatus,GeneralComments,ProjectOwner,Pillars,Prioritization,PreAnalysisComments,Ref_ID&$top=1&$filter=ID eq "+$itemID;
            var links_headers = { "accept": "application/json;odata=verbose" };
            var callback = function (data) {

                $.map(data.d.results, function (item, index) {
                    
                    //console.log(item);
                    
                    var Title = item.Title,
                        ProjectSponsor = item.ProjectSponsor,
                        ProjectOwner = item.ProjectOwner,
                        Pillars = item.Pillars,
                        preAnalysis = item.PreAnalysisComments,
                        GeneralComments = item.GeneralComments,
                        RequestStatus = item.RequestStatus,
                        Reference_ID = item.Ref_ID,
                        ID = item.ID,
                        EmpID = item.EmpID,
                        BusinessUnit = item.BusinessUnit,
                        StartDate = properDate(item.StartDate),
                        Prioritization = item.Prioritization;
                    
                    // Now Append the Values to HTML Markup
                    $('#inputProjTitle').val(Title).attr('readonly', true);
                    
                    $('#pre-analysis').val(preAnalysis);
                    $('#general_comments').val(GeneralComments);
                    $('#request_stat').val(RequestStatus);
                    
                    
                    $('#inputProjSponsor').val(ProjectSponsor).attr('readonly', true);
                    $('#inputProjOwner').val(ProjectOwner).attr('readonly', true);
                    $('#Pillars').val(Pillars).attr('readonly', true);
                    $('#Prioritize').val(Prioritization).attr('readonly', true);
                    $('#inputReference_ID').val(Reference_ID);
                    
                     $('#BUnits').val(BusinessUnit);
                    document.getElementById("inputStartDate").valueAsDate = new Date(StartDate);
                    
                    retrieveFile(Reference_ID);
                    fileProjectsList(EmpID);
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
    var fileProjectsList = function(curUserID) {
        //var curUserID =  _spPageContextInfo.userId;  

        //console.log(curUserID);
        // Make the REST call now
        //var url = "/_api/web/lists/getbytitle('User Information List')/items("+curUserID+")?$select=Title";
        var url = "/_api/Web/Lists/getByTitle('Demand')/Items?$select=ID,Created,RequestStatus,Prioritization,TradeOff,Title&$filter=AuthorId eq "+ curUserID;

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
                                '<td class="StartDate">05/24/2017</td> <td class="Prior">'+item.Prioritization+'</td>'+
                                '<td class="Status">'+item.RequestStatus+'</td> '+
                                '<td><label>'+item.TradeOff+'</label></td>'+
                                '<td class="itemID" style="display:none;">'+item.ID+'</td>'+
                            '</tr>';
            }); // Loop
            $trs += "</tbody>";

            $('#FileProjectList').append($trs);

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

    }; //FileProjectsList()
    
    
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
                 
                 var $trs = "<tbody id='skillSetsBody;'>";
                    $.each(data.d.results, function (index, item) {
                        console.log(item);
                        $trs += '<tr>'+
                                    '<td class="skillset_req">'+item.Title+'</td> <td class="resource_req">'+item.Resource+'</td>'+
                                '</tr>';
                    }); // Loop
                    $trs += "</tbody>";

                    $('#listingSkillSets').append($trs);
            });
            call.fail(function(jqXHR, textStatus, errorThrown) {
               var response = JSON.parse(jqXHR.responseText);
               var message = response ? response.error.message.value : textStatus;
               alert("Call failed on createAList() Error: "+message);
            });
        };// checkSkillsSets()
    
    
    var skillsSetsListed = function(curUserID) {
        //var curUserID =  _spPageContextInfo.userId;  

        console.log(curUserID);
        // Make the REST call now
        //var url = "/_api/web/lists/getbytitle('User Information List')/items("+curUserID+")?$select=Title";
        var url = "/_api/Web/Lists/getByTitle('Demand')/Items?$select=ID,Created,RequestStatus,Prioritization,TradeOff,Title&$filter=AuthorId eq "+ curUserID;

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
                            '<td class="skillset_req">System Architecture</td> <td class="resource_req">Resource 1</td>'+
                        '</tr>';
            }); // Loop
            $trs += "</tbody>";

            $('#skillSetsBody').append($trs);

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

    }; //skillsSetsListed()
    
});// Document Ready
 
</script>