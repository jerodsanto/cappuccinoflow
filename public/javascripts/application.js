$(function() {
  
  // item stuffs
  updateItemPreviewTitle();
  updateItemPreviewContent();
  
  $('#item_title').keyup(function(){
    updateItemPreviewTitle();
  });
  
  $("form[class$='item'] textarea").keyup(function(){
    updateItemPreviewContent();
  });
  
  // comment stuffs
  $('form.new_comment textarea').keyup(function(){
    updateCommentPreviewContent();
  });
  
  // admin stuffs
  $(".admin-actions").each(function(){
    var current = $(this);
    var parent  = current.parent();
    parent.mouseover(function() {
      current.show();
    });
    parent.mouseout(function() {
      current.hide();
    });
  }).hide();
  
});

function updateItemPreviewTitle() {
  var title = $('#item_title').val();
  if (typeof title != "undefined")
    $('#preview > h2').text(title);
}

function updateItemPreviewContent() {
  var content = $("form[class$='item'] textarea").val();
  if (typeof content != "undefined")
    $('#preview > div.entry').html(textilize(content));
}
function updateCommentPreviewContent() {
  var content = $("form.new_comment textarea").val();
  if (typeof content != "undefined")
    $('#preview > div.entry').html(textilize(content));
}

/*
 * This function originally from Stuart Langridge at http://www.kryogenix.org/
 * Heavily updated by Jeff Minard at http://www.creatimation.net/
 */

function textilize(s) {
    var r = s;
    // quick tags first
    qtags = [['\\*', 'strong'],
             ['\\?\\?', 'cite'],
             ['\\+', 'ins'],  //fixed
             ['~', 'sub'],   
             ['\\^', 'sup'], // me
             ['@', 'code']];
    for (var i=0;i<qtags.length;i++) {
        ttag = qtags[i][0]; htag = qtags[i][1];
        re = new RegExp(ttag+'\\b(.+?)\\b'+ttag,'g');
        r = r.replace(re,'<'+htag+'>'+'$1'+'</'+htag+'>');
    }
    // underscores count as part of a word, so do them separately
    re = new RegExp('\\b_(.+?)_\\b','g');
    r = r.replace(re,'<em>$1</em>');
	
	//jeff: so do dashes
    re = new RegExp('[\s\n]-(.+?)-[\s\n]','g');
    r = r.replace(re,'<del>$1</del>');

    // links
    re = new RegExp('"\\b(.+?)\\(\\b(.+?)\\b\\)":([^\\s]+)','g');
    r = r.replace(re,'<a href="$3" title="$2">$1</a>');
    re = new RegExp('"\\b(.+?)\\b":([^\\s]+)','g');
    r = r.replace(re,'<a href="$2">$1</a>');

    // images
    re = new RegExp('!\\b(.+?)\\(\\b(.+?)\\b\\)!','g');
    r = r.replace(re,'<img src="$1" alt="$2">');
    re = new RegExp('!\\b(.+?)\\b!','g');
    r = r.replace(re,'<img src="$1">');
    
    // block level formatting
	
		// Jeff's hack to show single line breaks as they should.
		// insert breaks - but you get some....stupid ones
	    re = new RegExp('(.*)\n([^#\*\n].*)','g');
	    r = r.replace(re,'$1<br />$2');
		// remove the stupid breaks.
	    re = new RegExp('\n<br />','g');
	    r = r.replace(re,'\n');
	
    lines = r.split('\n');
    nr = '';
    for (var i=0;i<lines.length;i++) {
        line = lines[i].replace(/\s*$/,'');
        changed = 0;
        if (line.search(/^\s*bq\.\s+/) != -1) { line = line.replace(/^\s*bq\.\s+/,'\t<blockquote>')+'</blockquote>'; changed = 1; }
		
		// jeff adds h#.
        if (line.search(/^\s*h[1-6]\.\s+/) != -1) { 
	    	re = new RegExp('h([1-6])\.(.+)','g');
	    	line = line.replace(re,'<h$1>$2</h$1>');
			changed = 1; 
		}
		
		if (line.search(/^\s*\*\s+/) != -1) { line = line.replace(/^\s*\*\s+/,'\t<liu>') + '</liu>'; changed = 1; } // * for bullet list; make up an liu tag to be fixed later
        if (line.search(/^\s*#\s+/) != -1) { line = line.replace(/^\s*#\s+/,'\t<lio>') + '</lio>'; changed = 1; } // # for numeric list; make up an lio tag to be fixed later
        if (!changed && (line.replace(/\s/g,'').length > 0)) line = '<p>'+line+'</p>';
        lines[i] = line + '\n';
    }
	
    // Second pass to do lists
    inlist = 0; 
	listtype = '';
    for (var i=0;i<lines.length;i++) {
        line = lines[i];
        if (inlist && listtype == 'ul' && !line.match(/^\t<liu/)) { line = '</ul>\n' + line; inlist = 0; }
        if (inlist && listtype == 'ol' && !line.match(/^\t<lio/)) { line = '</ol>\n' + line; inlist = 0; }
        if (!inlist && line.match(/^\t<liu/)) { line = '<ul>' + line; inlist = 1; listtype = 'ul'; }
        if (!inlist && line.match(/^\t<lio/)) { line = '<ol>' + line; inlist = 1; listtype = 'ol'; }
        lines[i] = line;
    }

    r = lines.join('\n');
	// jeff added : will correctly replace <li(o|u)> AND </li(o|u)>
    r = r.replace(/li[o|u]>/g,'li>');

    return r;
}

function reloadPreviewDiv() { 
    var commentString = document.getElementById('message').value;
	var con = superTextile(commentString);
    document.getElementById('previewcomment').innerHTML = con;
}
