import { Meteor } from 'meteor/meteor'
import { ReactiveVar } from 'meteor/reactive-var'
import { Users } from '../imports/api/collections_def.js'
import { Messages } from '../imports/api/collections_def.js'
import { Session } from 'meteor/session'


if (Meteor.isClient) {

	// reactive vars shared between all templates
	const is_logged_in = new ReactiveVar(false);
	const curr_username = new ReactiveVar(""); 


////////////////////////////////////////////////////
//////// main_content Template functions ///////////
////////////////////////////////////////////////////

	Template.main_content.helpers({
		get_curr_view: function() {
			return is_logged_in.get();
		}
	});

////////////////////////////////////////////////////
//////// sign_in_view Template functions ///////////
////////////////////////////////////////////////////

	Template.sign_in_view.onCreated(function() {
		this.error_msg = new ReactiveVar("");
	});

	Template.sign_in_view.helpers({
		get_error_msg: function() {
			return Template.instance().error_msg.get(); 
		}
	});

	Template.sign_in_view.events = {
		'click #log_in_button'(event, template) {
			var username_input = $('#username_text').val();

			if (username_input === "") {
				template.error_msg.set("Error: Please enter a username"); 
				return; 
			}
			var existing_usernames = Users.find({}).fetch();

			// check for the username already existing in Collection
			for (username in existing_usernames) {
				if (username_input === existing_usernames[username]['username']) {
					is_logged_in.set(true);
					curr_username.set(username_input);
					$('#username_text').val(''); 
					return; 
				}
			}
			template.error_msg.set("Error: Username does not exist"); 
		},

		'click #sign_up_button'(event, template) {
			var username_input = $('#username_text').val();

			if (username_input === "") {
				template.error_msg.set("Error: Please enter a username"); 
				return; 
			}

			// query username collection to find if username exists
			var existing_usernames = Users.find({}).fetch();

			// check for the username already existing in Collection
			for (username in existing_usernames) {
				if (username_input === existing_usernames[username]['username']) {
					console.log(existing_usernames[username]['username']);
					template.error_msg.set("Error: Username already exists"); 
					return; 
				}
			}
			Users.insert( {'username' : username_input }); 
			is_logged_in.set(true);
			curr_username.set(username_input);
			$('#username_text').val('');
		},
	};

////////////////////////////////////////////////////
/////// messenger_view Template functions //////////
////////////////////////////////////////////////////


	Template.messenger_view.onCreated(function() {
		this.chat_friend = new ReactiveVar("");
	});
	
	Template.messenger_view.helpers({
		get_curr_user: function() {
			return curr_username.get(); 
		},

		get_chat_friend: function() {
			return Template.instance().chat_friend.get();
		},

		get_users: function () {
			var init_list = Users.find({}).fetch(); 
			var user_list = [];

			for (doc_obj in init_list) {
				if (init_list[doc_obj]["username"] !== curr_username.get()) {
					user_list.push(init_list[doc_obj]["username"]);
				}
			}
			return user_list;
		},

		get_messages: function() {
			var msgs_to_disp = Messages.find({
				$or: [ {from: curr_username.get(), to: Template.instance().chat_friend.get() } ,
					  {from: Template.instance().chat_friend.get(), to: curr_username.get() } 
				]
			});

			return msgs_to_disp;

		},

	});

	Template.messenger_view.events = {
		'click #msg_input_btn'(event, template) {
			var $message = $('#message');
			if ($message.val() != '') {
				// Insert content into the collection
				Messages.insert( {from: curr_username.get(),
								  to: template.chat_friend.get(),
								  message: $message.val()
								 } 
				);
				$('#message').val('');
			}
		},
		
		'click #log_out_btn'(event, template) {
			is_logged_in.set(false);
		},

		'click .delete_msg_btn'(event, template) {
			Messages.remove({ _id: event.target.id});
		},

		'change #user_selector'(event, template) {
			template.chat_friend.set($("#user_selector option:selected").text());
		}
	}
}