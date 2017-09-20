
<script type="text/javascript">
</script>

    jQuery('#uploadURsFile').click(function(e) {
        e.preventDefault();
        AddAttachments(11);
    });

    var AddAttachments = function (itemId){
     var digest = "";
        $.ajax({
            url: "/_api/contextinfo",
            method: "POST",
            headers: {
            "ACCEPT": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose"
        },

        success: function (data) {
            // digest = data.d.GetContextWebInformation.FormDigestValue;
            // digest =  $('#__REQUESTDIGEST').val(data.d.GetContextWebInformation.FormDigestValue)
            digest =  $('#__REQUESTDIGEST').val();
        },
        error: function (data) {
        }
        }).done(function() {
            var fileInput = $('#attachURS');
            console.log(fileInput);
            var fileName = fileInput[0].files[0].name;
            var reader = new FileReader();
            reader.onload = function (e) {
                var fileData = e.target.result;

                var res11 = $.ajax({
                    url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Demand')/items("+itemId+")/AttachmentFiles/add(FileName='" + fileName + "')",
                    method: "POST",
                    binaryStringRequestBody: true,
                    data: fileData,
                    processData: false,
                    headers: {
                        "ACCEPT": "application/json;odata=verbose",
                        "X-RequestDigest": digest
                     
                    },
                    success: function (data) {
                    },
                    error: function (data) {
                    }
                });
            };

            reader.readAsArrayBuffer(fileInput[0].files[0]);
        });
    }; // AddAttachments()