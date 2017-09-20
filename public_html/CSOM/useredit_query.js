var retreiveEditItem = function() {
    // alert("We are in fetchingrecords() record "+id);
    var links_url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('Demand')/items?$select=ID,Created,RequestStatus,ReStartDate,Title,ProjectSponsor,ProjectOwner,Pillars,Prioritization&$top=1&$filter=ID eq 8";
    var links_headers = { "accept": "application/json;odata=verbose" };
    var callback = function (data) {

    $.map(data.d.results, function (item, index) {

        console.log(item);

        var Title = item.Title,
            ProjectSponsor = item.ProjectSponsor,
            ProjectOwner = item.ProjectOwner,
            Pillars = item.Pillars,
            Created = item.Created,
            RequestStatus = item.RequestStatus,
            StartDate = item.StartDate,
            Prioritization = item.Prioritization;

        // Now Append the Values to HTML Markup
        $('#inputProjTitle').val(Title);
        $('#inputProjSponsor').val(ProjectSponsor);
        $('#inputProjOwner').val(ProjectOwner);
        $('#inputStartDate').val(StartDate);
        $('#projPillars option:selected').text(Pillars);
        $('#Prioritization option:selected').text(Prioritization);
        //$('#inputReference_ID').val(Reference_ID);
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
}(); //retreiveEditItem()








var updateItems = function($id) {       
            var proj = $('#inputProjTitle').val();
            var sponsor  = $('#inputProjSponsor').val();
            var owner = $('#inputProjOwner').val();
            //$('#inputStartDate').val(StartDate);
            var pillar = $('#projPillars option:selected').text();
            var priority  = $('#Prioritization option:selected').text();
            var bunit = $('#BUnits option:selected').text();
            //document.getElementById("inputStartDate").valueAsDate = new Date(StartDate);
            var date_start = $('#inputStartDate').val();
            //$('#inputReference_ID').val(Reference_ID);
            var req_status = $('#requested_status span').text();
            var date_created = $('#date_created span').text();


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
                var div = $('#messages');
                    div.html('<div class="alert alert-success alert-dismissible fade show" role="alert">'+
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
                          '<span aria-hidden="true">&times;</span>'+
                        '</button>'+
                        '<strong>Item Updated Successfully!</strong>'+
                      '</div>');            
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