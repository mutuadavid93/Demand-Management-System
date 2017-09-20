$(document).ready(function() {
        jQuery('#submitRequest').click(function(e) {
            e.preventDefault();
            createListItem(); // invoke the func
        });
    
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
            //console.log(data.d.AccountName);
        });
        call.fail(function(jqXHR, textStatus, errorThrown) {
            failHandler(jqXHR, textStatus, errorThrown);
        });
        
        
        
        
         function addItem(userId){ 
            console.log("Inside addItem() UserID: "+userId);
            
             // Retrieve the typed values
            var ProjTitle = $('#inputProjTitle').val();
            var sponsor = $('#inputProjSponsor').val();
            var ProjOwner = $('#inputProjOwner').val();
            var Pillar = $('#projPillars option:selected').text(); 
            var BusinessUnit = $('#BUnits option:selected').text(); 
            var StartDate = $('#inputStartDate').val(); 
            var Priority = $('#Prioritization option:selected').text();
            
            // Generate a Random Number
            function randomNumberFromRange(min,max)
            {
                return Math.floor(Math.random()*(max-min+1)+min);
            }

            var today = new Date();
            var dates = new Date("2014-04-03");
            var reallyRandomNumber = "Ref_"+randomNumberFromRange(today.getTime(), dates.getTime()*113);
            //console.log("Ref_"+randomNumberFromRange(today.getTime(), dates.getTime()*113));

            var call = jQuery.ajax({
                url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('Demand')/Items",
                type: "POST",
                contentType: "application/json;odata=verbose",
                data: JSON.stringify({
                    "__metadata" : {type: "SP.Data.DemandListItem"},
                    Title: ProjTitle,
                    ProjectSponsor: sponsor,
                    ProjectOwner: ProjOwner,
                    s2zcId:  userId,
                    Pillars: Pillar,
                    BusinessUnit: BusinessUnit,
                    StartDate: StartDate,
                    Ref_ID: reallyRandomNumber,
                    Prioritization: Priority
                }),
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                    "X-HTTP-Method": "POST"
                }
            });

            call.done(function(data, textStatus, jqXHR) {
                var div = $('#message');
                div.html('<div class="alert alert-success alert-dismissible fade show" role="alert">'+
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'+
                      '<span aria-hidden="true">&times;</span>'+
                    '</button>'+
                    '<strong>Item Added Successfully!</strong>'+
                  '</div>');
          
                  
                uploadDocument(reallyRandomNumber);
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
    };
 
    
    /*
     * REAL FILE UPLOAD
     */

    function uploadDocument(ItemRef_ID) {  
        if(!window.FileReader){
            alert("HTM5 File API not Support in this Browser");
            return;
        }

        var context = SP.ClientContext.get_current();
        var web = context.get_web();
        var list = web.get_lists().getByTitle("FilesStore");

        var element = document.getElementById('uploadInputCSOM');
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
            alert("Document uploaded too");
        }

        function fail(sender, args) {
           alert(args.get_message());
        }
    } // uploadDocument
    
}); // document Ready


    