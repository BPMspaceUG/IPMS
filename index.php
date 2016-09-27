<?php
  include_once '_header.inc.php';
?>
  <!-- Content -->
  <div>
    <div class="container" style="padding-top: 30px">
      <form class="bpm-server-connect" action="modules/ConnectDB.php">
        <h3 class="title">connect</h3>
        <div class="form-group row">
              <label for="sqlServer" class="col-sm-2 form-control-label">MySQL Server</label>
              <div class="col-sm-2">
                  <input type="text" class="form-control" autocomplete="off" name="host" id="sqlServer"
                         placeholder="localhost" value="localhost">
              </div>
              <label for="sqlPort" class="col-sm-2 form-control-label">MySQL Port</label>
              <div class="col-sm-2">
                <input type="number" autocomplete="off" class="form-control" name="port" id="sqlPort"
                       placeholder="3306" value="3306">
              </div>

              <div class="col-sm-1">
                <button id="new" type="reset" class="btn btn-success" name="new">New</button>
              </div>

              <!--            <div class="col-sm-1">-->
              <!--                <a href="#deleteDb" data-toggle="modal" class="btn btn-danger" id="delete" name="delete">Delete</a>-->
              <!--            </div>-->

              <div class="col-sm-1">
                <button id="connect" type="button" class="btn btn-info" name="connect" value="true">Connect</button>
              </div>
          </div>
          <div class="form-group row">
              <label for="username" class="col-sm-2 form-control-label">username</label>
              <div class="col-sm-2">
                  <input type="text" autocomplete="off"  class="form-control" id="username" name="user"
                         placeholder="root" value="root">
              </div>
              <label for="password" class="col-sm-2 form-control-label">password</label>
              <div class="col-sm-2">
                <input type="password" value="" autocomplete="off" class="form-control" id="sqlPass" name="pwd"
                       placeholder="password">
              </div>

              <div class="col-sm-1">
                <a href="#loadDb" name="load" data-toggle="modal" id="loadF" class="btn btn-default "
                   name="load">Load</a>
              </div>

              <div class="col-sm-1">
                <button type="button" name="save" id="save" class="btn btn-primary" name="save">Save</button>
              </div>
              <div class="col-sm-2">
                <i class="fa fa-check" aria-hidden="true" style="display: none"></i>
                <i class="fa fa-minus-circle" aria-hidden="true" style="display: none"></i>
              </div>
          </div>
          <small>This action may take some time</small>
      </form>
  </div>

  <!--Databases-->
  <div class="container">
    <div class="row">
      <!-- Database -->
      <div class="row">
        <label for="sqlDatabases" class="col-sm-2"><span class="label label-success">1</span> Databases</label>
        <select class="form-control" id="sqlDatabases">
          <option value="">Select a database from dropdown</option>
        </select>
      </div>
      <!-- Tables -->
      <div class="row">
        <label for="sqlTables" class="col-sm-2"><span class="label label-success">2</span> Tables</label>
        <div class="row" id="sqlTables"></div>
      </div>
      <!-- Create Button -->
      <div class="row">&nbsp;</div>
      <div class="row">
        <label class="col-sm-2"><span class="label label-success">3</span> Create</label>
        <div>
          <button name="create" class="btn btn-danger" id="create"><i class="fa fa-play"></i> CREATE</button>
          <a name="test" class="btn btn-success" href="../IPMS_test/" target="_blank">
            <i class="fa fa-folder-open"></i> Open Test Directory
          </a>
        </div>
      </div>

      <!--            File String -->
      <div class="row">
        <div class="col-md-12" id="code">
            <button class="btn btn-default bpm-copy" name="copy" data-clipboard-target="#bpm-code" >Copy
              All</button>
            <div readonly style="width: 100%; min-height: 50px; max-height: 100px; resize: none; padding:
              50px 0 0; margin:0 0 50px; overflow:auto;" class="bpm-textarea" id="bpm-code">
              Currently Empty
            </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Load Modal -->
  <div class="modal fade" id="loadDb">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
          <h3 class="modal-title">Stored Connections</h3>
        </div>
        <div class="modal-body">
          <h5 class="text-center">List of Stored connections in Database</h5>
          <table class="table table-striped" id="tblGrid">
            <thead id="tblHead_1">
            <tr>
              <th>Id</th>
              <th>Host</th>
              <th>Username</th>
              <th>Port</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody class="connection-values">
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default " data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</div>
<?php
  include_once "_footer.inc.php"
?>

