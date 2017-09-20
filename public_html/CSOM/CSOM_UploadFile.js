
<div id="message"></div>

<input type="file" id="uploadInputCSOM" />
<button id="upload">Upload</button>


<script
  src="https://code.jquery.com/jquery-2.2.4.min.js"
  integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
  crossorigin="anonymous"></script>

<script language="javascript" type="text/javascript">
var fileInput;
$(document).ready(function()   
{  
    //fileInput = $("#uploadInputCSOM");  
    //SP.SOD.executeFunc('sp.js', 'SP.ClientContext', registerClick);
    
    
    $('#upload').click(function (e) {
         e.preventDefault();
         uploadDocument();
    });

    
    function uploadDocument() {  
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
            item.set_item("Ref_ID", "Ref_4567");
            item.set_item("Employee", web.get_currentUser());
            item.update();
            
            context.executeQueryAsync(success2, fail);
        }//success1
        
        function success2() {
            var message = jQuery("#message");
            message.text("Document uploaded");
        }
        
        function fail(sender, args) {
           alert(args.get_message());
        }
    } // uploadDocument
});

/*function registerClick(){
}*/

    
</script>