

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
           if(!window.FileReader){
               alert("This browser doesn't support HTML 5 File APIs");
               return;
           }

           var call = getDocument();
           call.done(function (buffer, fileName) {
                // upload a doc
                var call2 = uploadDocument(buffer, fileName);
                call2.done(function (data, textStatus, jqXHR) {
                   var message = jQuery('#messages');
                   message.text("Document uploaded");
                });
                call2.fail(failHandler);
            });

            call.fail(function (errorMessage) {
                alert(errorMessage);
            });

           // Make Service Calls
            function getDocument() {
                var def = new jQuery.Deferred()

                var element = document.getElementById('uploadInput');
                var file = element.files[0];
                var parts = element.value.split("\\");
                var fileName = parts[parts.length - 1];

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

            function uploadDocument(buffer, fileName) {
                var url = String.format("{0}/_api/Web/Lists/getByTitle('Categories')/AttachmentFiles/Add(url='{1}', overwrite=true)",
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
        };

        function failHandler(jqXHR, textStatus, errorThrown){
            var resp = JSON.parse(jqXHR.responseText);
            var message = resp ? resp.error.message.value : textStatus;
            alert("Call failed on createListItem(). Error: "+message);
        }
    });
</script>
