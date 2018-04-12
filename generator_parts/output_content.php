<!-- Loading Screen or Errors -->
<!--
<div class="container">
  <div class="alert alert-info" ng-show="isLoading">
    <p><i class="fa fa-cog fa-spin"></i> Loading ...</p>
  </div>
</div>
-->

<!-- body content starts here  -->
<div class="container" id="content" style="width: 100%">
  <div class="row">
    <div class="col-xs-12">
      <div class="panel panel-default panel-table">
        <!-- Panel Header -->
        <div class="panel-heading">
          <!-- Tabs -->
          <ul class="nav nav-tabs">
          </ul>
        </div>
        <!-- Panel Body -->
        <div class="panel-body">
          <div class="tab-content">
            <div>
              <!-- Table Options -->
              <div class="tab-pane">
                <div class="table_x"></div>
              </div>              
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</div>

<!-- Modal for Edit -->
<div class="modal fade" id="modalEditEntry" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <h4 class="modal-title">
          <i class="fa fa-pencil"></i> Edit Entry <small>in <b>#Table</b></small>
        </h4>
      </div>
      <div class="modal-body">
        <div class="edit_form"></div>
      </div>
      <div class="modal-footer">
        <span class="footer_btns">
          <button class="btn btn-primary" id="btnSaveEntry" type="button">Save &amp; Close</button>
        </span>
        &nbsp;
        <button class="btn btn-default pull-right" type="button" data-dismiss="modal">
          <i class="fa fa-times"></i> Close</button>
      </div>
    </div>
  </div>
</div>