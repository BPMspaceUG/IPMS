<?php
  include_once '_dbconfig.inc.php';
  include_once '_header.inc.php';
?>
<div class="clearfix"></div>
<div class="container">
  <!-- Table -->
  <table class="table table-condensed table-striped">
    <thead>
      <tr>
        <th>&nbsp;</th>
        <th>ID</th>
        <th>Name</th>
        <th>Topic</th>
        <th>Test</th>
        <th>Min. Participants</th>
        <th>Deprecated</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      <tr ng-repeat="c in courses">
        <td style="width: 100px;">
          <span class="btn pull-left" ng-click="setSelectedCourse(c)">
            <i ng-class="{'fa fa-fw fa-check-square-o': c.ID === actCourse.ID, 'fa fa-fw fa-square-o': c.ID != actCourse.ID}"></i>
          </span>
          <a class="btn pull-left" ng-click="editcourse(c)"><i class="fa fa-fw fa-pencil"></i></a>
        </td>
        <td>{{c.ID}}</td>
        <td style="width: 350px;">{{c.Name}}</td>
        <td>{{c.Topic}}</td>
        <td>{{c.Test}}</td>
        <td>{{c.MinPart}}</td>
        <td>{{c.Depr}}</td>
        <td>{{c.Price}}</td>
      </tr>
    </tbody>
  </table>
</div>

<!-- Template Modal "Edit Syllabus" -->
<script type="text/ng-template" id="modalEditCourse.html">
	<div class="modal-header">
		<h3 class="modal-title">Edit course</h3>
	</div>
	<div class="modal-body">
	  <form class="form-horizontal">
	  <fieldset>
      <legend>Edit course</legend>
      <div class="form-group">
        <label class="col-sm-2 control-label">Course ID</label>
        <div class="col-sm-10"><input ng-model="object.data.ID" class="form-control" type="text" disabled/></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Course name</label>
        <div class="col-sm-10"><input ng-model="object.data.Name" class="form-control" type="text" /></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Topic</label>
        <div class="col-sm-10"><input ng-model="object.data.Topic" class="form-control" type="text" disabled/></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Course Headline</label>
        <div class="col-sm-10"><input ng-model="object.data.courseHeadline" class="form-control" type="text" /></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Test</label>
        <div class="col-sm-10"><input ng-model="object.data.Test" class="form-control" type="text" /></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Number of Days</label>
        <div class="col-sm-10"><input ng-model="object.data.number_of_days" class="form-control" type="text" /></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Number of Trainers</label>
        <div class="col-sm-10"><input ng-model="object.data.number_of_trainers" class="form-control" type="text" /></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Min. Participants</label>
        <div class="col-sm-10"><input ng-model="object.data.MinPart" class="form-control" type="text" /></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Deprecated</label>
        <div class="col-sm-10"><input ng-model="object.data.Depr" class="form-control" type="text" /></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Course Description</label>
        <div class="col-sm-10"><textarea data-ui-tinymce ng-model="object.data.courseDescription"></textarea></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Course Image</label>
        <div class="col-sm-10"><textarea class="form-control" ng-model="object.data.courseImage"></textarea></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Course Description Mail</label>
        <div class="col-sm-10"><textarea data-ui-tinymce ng-model="object.data.courseDescriptionMail"></textarea></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Course Price</label>
        <div class="col-sm-10"><input ng-model="object.data.Price" class="form-control" type="text" /></div>
      </div>
      <div class="form-group">
        <label class="col-sm-2 control-label">Course Description Certificate</label>
        <div class="col-sm-10"><textarea data-ui-tinymce ng-model="object.data.courseDescriptionCertificate"></textarea></div>
      </div>
	  </fieldset>
	  </form>
	</div>
	<div class="modal-footer">
		<button class="btn btn-primary" type="button" ng-click="ok()"><i class="fa fa-floppy-o"></i> Save</button>
		<button class="btn btn-warning" type="button" ng-click="cancel()"><i class="fa fa-times"></i> Cancel</button>
	</div>
</script>

<!-- Custom -->
<script src="./custom/custom.js"></script>
<?php
  include_once '_footer.inc.php';
?>
 
 