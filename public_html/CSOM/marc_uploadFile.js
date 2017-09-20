

<script
  src="https://code.jquery.com/jquery-2.2.4.min.js"
  integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
  crossorigin="anonymous"></script>

<button id="submitNow">Upload</button>
<input id="my-attachments" type="file" fileread="run.AttachmentData" fileinfo="run.AttachmentInfo" />

<script type="text/javascript">

$(document).ready(function() {

jQuery('#submitNow').on('click', function(event) {
            event.preventDefault();
            atttack();
        });

 var ID = 1;
 var listname = "Categories";

 function atttack() {

    var element = document.getElementById('my-attachments');
  var file = element.files[0];
  
  console.log(file);

  var getFileBuffer = function(file) {

   var deferred = $.Deferred();
   var reader = new FileReader();

   reader.onload = function(e) {
    deferred.resolve(e.target.result);
   }

   reader.onerror = function(e) {
    deferred.reject(e.target.error);
   }

   reader.readAsArrayBuffer(file);

   return deferred.promise();
  };

  getFileBuffer(file).then(function(buffer) {

   $.ajax({
    url: _spPageContextInfo.webAbsoluteUrl +
     "/_api/web/lists/getbytitle('" + listname + "')/items(" + ID + ")/AttachmentFiles/add(FileName='" + file.name + "')",
    method: 'POST',
    data: buffer,
    processData: false,
    headers: {
     Accept: "application/json;odata=verbose",
    "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
    "Content-Length": buffer.byteLength
    }
   });

  });

 }
});

</script>