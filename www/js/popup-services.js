angular.module('popup.services', [])

.factory('popupService', function() 
{
	return {
		openFormErrorPopup: function()
		{
			$('#basicPopup .message').hide();
			$('#basicPopup .message.formError').show();
			
			$('#basicPopup .actions a').hide();
			$('#basicPopup .actions a.acceptDismissButton').show();
			
			$('#basicPopup').modal('show');
		},
		openConfirmSavePhotoPopup: function()
		{
			$('#basicPopup .message').hide();
			$('#basicPopup .message.savePhoto').show();
			
			$('#basicPopup .actions a').hide();
			$('#basicPopup .actions a.acceptButton').show();
			$('#basicPopup .actions a.cancelButton').show();
			
			$('#basicPopup').modal('show');
		},
		openErrorConnectionPopup: function()
		{
			$('#basicPopup .message').hide();
			$('#basicPopup .message.errorConnection').show();
			
			$('#basicPopup .actions a').hide();
			$('#basicPopup .actions a.acceptDismissButton').show();
			
			$('#basicPopup').modal('show');
		},
		openSyncSuccessPopup: function()
		{
			$('#basicPopup .message').hide();
			$('#basicPopup .message.syncSuccess').show();
			
			$('#basicPopup .actions a').hide();
			$('#basicPopup .actions a.finalizeButton').show();
			
			$('#basicPopup').modal('show');
		}
	};
});