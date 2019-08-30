## -*- coding: utf-8 -*-

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<!-- This file copyright © 2012 by Aaron Ecay, Anton Ingason.  It is made
available under the terms of the GNU GPL, version 3 or (at your option)
any later version.  See the LICENSE file for more information. -->

<html>
  <head>
    <title>Annotald</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link rel="stylesheet" type="text/css" href="css/treedrawing.css" />
%if colorCSS:
    <style type="text/css">
    ${open(colorPath).read()}
    </style>
%endif
%if debugJs:
    <script type= "application/javascript" src="scripts/jquery-debug.js"></script>
%else:
    <script type= "application/javascript" src="scripts/jquery.js"></script>
%endif
    <script type= "application/javascript" src="scripts/jquery.mousewheel.min.js"></script>
    <script type= "application/javascript" src="scripts/treedrawing.utils.js"></script>
    <script type= "application/javascript" src="scripts/treedrawing.js"></script>
    <script type= "application/javascript" src="scripts/underscore-min.js"></script>
    <script type="application/javascript">var startTime = ${startTime};</script>
%for script in extraScripts:
    <script type="application/javascript">
      ${open(script).read()}
    </script>
%endfor
    <script type= "application/javascript">  ${currentSettings} </script>
    <script type= "application/javascript" src="scripts/treedrawing.contextMenu.js"></script>

  </head>
  <body oncontextmenu="return false;">
    <br />
    <div id="menus">
      <div id="floatMenu" class="menuPane">
        <div class="menuTitle">
          Annotald ${annotaldVersion}
        </div>

        Editing: ${shortfile} <br />
        <input class="menubutton" type="button" value="Save" id="butsave" /><br />
        <div id="undoCtrls">
        <input class="menubutton" type="button" value="Undo" id="butundo" /><br />
        <input class="menubutton" type="button" value="Redo" id="butredo" /><br />
        </div>
        <input class="menubutton" type="button" value="Exit" id="butexit" /><br />
      </div>

      <div id="toolsMenu" class="menuPane">
        <div class="menuTitle">Tools</div>
        <!--
        <input class="menubutton" type="button" value="Search"
               id="butsearch" style="margin-top:4px;" /><br />
        <div id="matchcommands">
          <input class="menubutton" type="button" value="Next Match" id="butnextmatch" /><br />
          <input class="menubutton" type="button" value="Clear Matches" id="butclearmatch" /><br />
        </div>
        </select>
        <input class="menubutton" type="button" value="Validate" id="butvalidate" /><br />
        <input class="menubutton" type="button" value="Next Error" id="butnexterr" /><br />
        -->
        <input class="menubutton" type="button" value="Hide comments" id="menu-button-comment" data-command="hide" /><br />
      </div>
      <div id="metadataEditor"
%if not usemetadata:
           style="visibility:hidden;"
%endif
           >
        <div class="menuTitle">Metadata</div>
        <div id="metadata"></div>
      </div>

      <div id="messageBox" class="menuPane">
        <div class="menuTitle" id="messagesTitle">Messages</div>
        <div id="messageBoxInner">----</div>
%if usetimelog:
	<div class="menuTitle">Status</div>
	<div id="idlestatus">${idle}</div>
%endif
      </div>
    </div>

    <div id="editpane">${currentTree}</div>


    <div id="conMenu">
      <div id="conLeft" class="conMenuColumn">
        <div class="conMenuItem"><a>IP-SUB</a></div>
        <div class="conMenuItem"><a>IP-INF</a></div>
        <div class="conMenuItem"><a>IP-SMC</a></div>
        <div class="conMenuItem"><a>-SPE</a></div>
        <div class="conMenuItem"><a>-PRN</a></div>
        <div class="conMenuItem"><a>-XXX</a></div>
      </div>

      <div id="conRight" class="conMenuColumn">
        <div class="conMenuItem"><a>XXX</a></div>
        <div class="conMenuItem"><a>XXX</a></div>
      </div>

      <div id="conRightest" class="conMenuColumn">
        <div class="conMenuItem"><a>XXX</a></div>
        <div class="conMenuItem"><a>XXX</a></div>
      </div>
    </div>

    <div id="dialogBox" class="menuPane">
    </div>

    <div id="dialogBackground"></div>

    <div id="urtext"></div>

  </body>
  <script>
  var annotrees = ${annotrees} ;
  </script>
</html>
