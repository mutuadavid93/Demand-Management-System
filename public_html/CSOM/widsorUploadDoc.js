

<div id="messages"></div>
<input type="file" id="uploadInput" />
<button id="submitNow">Upload</button>

<script
  src="https://code.jquery.com/jquery-2.2.4.min.js"
  integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
  crossorigin="anonymous"></script>
  
<script type="text/javascript">
    $(function () {

        jQuery('#submitNow').on('click', function(event) {
            event.preventDefault();
            uploadDocument();
        });

        var uploadDocument = function () {
        // Check whether the Browser Supports HTML5 File API
           if(!window.FileReader){
               alert("This browser doesn't support HTML 5 File APIs");
               return;
           }

           // Now kick-off the Individual Calls
           /*
           
           NB: CHECK MY GIT ABOUT THE SIMPLE CALL FOR JUST FILE UPLOAD
           */
           var call = getDocument();
           call.done(function (buffer, fileName) {
                // upload a doc
                var call2 = uploadDocument(buffer, fileName);
                call2.done(function (data, textStatus, jqXHR) {
                   var call3 = getItem(data.d);
                   call3.done(function (data, textStatus, jqXHR) {
                       var item = data.d;
                       var call4 = getCurrentUser();
                       call4.done(function (data, textStatus, jqXHR) {
                          var userId = data.d.CurrentUser.Id;
                          var call5 = updateItemFields(item, userId);
                          call5.done(function () {
                             var div = jQuery('#messages');
                             div.text("Item added");
                            });
                            call5.fail(failHandler);
                        });
                        call4.fail(failHandler);
                    });
                    call3.fail(failHandler);
                });
                call2.fail(failHandler);
            });

            call.fail(function (errorMessage) {
                alert(errorMessage);
            });

           // Make Service Calls
            function getDocument() {
                var def = new jQuery.Deferred()

                // get the info about the File the User has chosen
                var element = document.getElementById('uploadInput');
                var file = element.files[0];
                var parts = element.value.split("\\");
                var fileName = parts[parts.length - 1];

                // Read the File Contents
                var reader = new FileReader();
                reader.onload = function (event) {
                    def.resolve(event.target.result, fileName);
                }
                reader.onerror = function (event) {
                    def.reject(event.target.error);
                }
                reader.readAsArrayBuffer(file);

                // Return the promise associated with that defered Object
                return  def.promise();
            } //getDocument

            // Pass off the results to uploadDocument()
            function uploadDocument(buffer, fileName) {
                var url = String.format("{0}/_api/Web/Lists/getByTitle('Project Documents')/RootFolder/Files/Add(url='{1}', overwrite=true)",
                        _spPageContextInfo.webAbsoluteUrl, fileName);

                var call = $.ajax({
                    url: url,
                    type: "POST",
                    data: buffer,
                    processData: false,
                    headers: {
                        Accept: "application/json;odata=verbose",
                        "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                        "Content-Length": buffer.byteLength
                    }
                }); // ajax

                return call;
            } //uploadDocument
            
            // Update Metadata Along 
            function getItem(file) {
                 var call = jQuery.ajax({
                    url: file.ListItemAllFields.__deferred.uri,
                    type: "GET",
                    dataType: "json",
                    headers:{
                        Accept: "application/json;odata=verbose"
                    }
                 }); 
                 
                 return call;
            }
            
            // Update the Current User Editing
            function getCurrentUser() {
                var call = jQuery.ajax({
                   url: _spPageContextInfo.webAbsoluteUrl + "/_api/Web/?$select=CurrentUser/Id&$expand=CurrentUser/Id" ,
                   type: "GET",
                   dataType: "json",
                   headers: {
                      Accept: "application/json;odata=verbose" 
                   }
                });
                
                return call;
            };
            
            
            // Now the Actual Update
            function updateItemFields(item, userId) {
               var now = new Date();
               var call = jQuery.ajax({
                  url:  _spPageContextInfo.webAbsoluteUrl + "/_api/Web/Lists/getByTitle('Project Documents')/Items("+item.Id+")",
                  type: "POST",
                  data: JSON.stringify({
                     "__metadata": {type: "SP.Data.Project_x0020_DocumentsItem"},
                         CoordinatorId: userId,
                         Year: now.getFullYear()
                  }),
                  headers:{
                        Accept: "application/json;odata=verbose",
                        "Content-Type": "application/json;odata=verbose",
                        "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(), 
                        "IF-MATCH": item.__metadata.etag,
                        "X-Http-Method" : "MERGE"
                  }
               });
               
               return call;
            }
            
        };

        function failHandler(jqXHR, textStatus, errorThrown){
            var resp = JSON.parse(jqXHR.responseText);
            var message = resp ? resp.error.message.value : textStatus;
            alert("Call failed on createListItem(). Error: "+message);
        }
    });
</script>
