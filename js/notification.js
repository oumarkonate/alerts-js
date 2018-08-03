class Notification {
  constructor () {
    this.timeout = 5000;
    this.notifContainer = document.getElementById('notif-container');

    this.addNotificationsEventListeners();
  }

  /**
   * addEventListener to notify user displaying a notification box
   */
  addNotificationsEventListeners () {
    // addEventListener to notify user
    addEventListener('onUserNotify', this.notifyUser.bind(this));

    // Close notification box when user clicks on the page
    addEventListener('click', (event) => {
      if (event.target === this.notifContainer) {
        this.deleteNotification();
      }
    });
  }

  /**
   * Notify user displaying a notification box
   *
   * Notification types:
   *  'error' => display error notification box
   *  'succes' => display succes notification box
   *  'info' => display info notification box
   *
   * @param event
   */
  notifyUser (event) {
    if (!event.message) {
      return;
    }

    this.message = event.message;
    this.timeout = event.timeout ? event.timeout : this.timeout;

    this.deleteNotification();
    this.createNotificationBox();
    this.resizeNotification();

    // Close notification box when user click on button close
    const notifContainerClose = document.querySelector('.notif-container-close');

    notifContainerClose.addEventListener('click', this.deleteNotification.bind(this));
  }

  /**
   * Resize notification box
   */
  resizeNotification () {
    const notifContainer = document.querySelector('.notif-container');
    const notifContainerContent = document.querySelector('.notif-container-content');

    notifContainerContent.style.position = 'relative';
    notifContainerContent.style.top = (notifContainer.clientHeight / 2 - notifContainerContent.clientHeight / 2) + 'px';
  }

  /**
   * Delete notification box
   */
  deleteNotification () {
    if (document.body.contains(this.notifContainer)) {
      document.body.removeChild(this.notifContainer);
    }
  }

  /**
   * Create notification box
   */
  createNotificationBox () {
    const notifContainerContent = `
                    <div class="notif-container-content">
                        <span class="notif-container-close">X</span>
                        <p>${this.message}</p>
                    </div>
                  `;

    // Create node element 'notif-container'
    this.notifContainer = Object.assign(document.createElement('div'), {
      className: 'notif-container',
      id: 'notif-container',
      innerHTML: notifContainerContent
    });

    // Add 'notif-container' to html
    document.body.appendChild(this.notifContainer);

    // Add timeout to delete notification box
    setTimeout(() => {
      this.deleteNotification();
    }, this.timeout);
  }
}

module.exports = Notification;