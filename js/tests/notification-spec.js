const chai = require('chai'),
      sinon = require('sinon'),
      jsdom = require("jsdom"),
      { JSDOM } = jsdom;

const Notification = require('../notification');

describe('#Test Notification', () => {
  const sandBox = sinon.createSandbox(), 
        expect = chai.expect,
        dom = new JSDOM('');        

  window = dom.window;
  document = dom.window.document;

  afterEach(() => {
    if (sandBox.restore) {
      sandBox.restore();
    }
  });

  describe('#Test constructor', () => {
    before(() => {
      sandBox.stub(Notification.prototype, 'addNotificationsEventListeners');
    });

    it('Should test constructor property', () => {
      const notification = new Notification();

      expect(notification).to.have.property('timeout').to.equal(5000);
      expect(notification).to.have.property('notifContainer');
      expect(notification.addNotificationsEventListeners.calledOnce).to.be.true;
    });
  });

  describe('#Test notifyUser', () => {
    describe('When event message is empty', () => {
      before(() => {
        sandBox.stub(Notification.prototype, 'addNotificationsEventListeners');
      });

      it('Should return', () => {
        const notification = new Notification();

        expect(notification.notifyUser({})).to.be.an('undefined');
      });
    });

    describe('When event message is not empty', () => {
      let stubQuerySelector;

      beforeEach(() => {
        stubQuerySelector = sandBox.stub(document, 'querySelector').withArgs('.notif-container-close');
        sandBox.stub(Notification.prototype, 'addNotificationsEventListeners');
        sandBox.stub(Notification.prototype, 'resizeNotification');

        stubQuerySelector.returns({addEventListener: sandBox.spy()});
      });

      describe('When timeout is specified', () => {
        it('Should test method notifyUser', () => {
          const event = {message: 'Une erreur est survenue, veuillez réessayer dans quelques instants', timeout: 1000};
          const notification = new Notification();

          notification.notifyUser(event);

          expect(notification).to.have.property('message').that.equal('Une erreur est survenue, veuillez réessayer dans quelques instants');
          expect(notification).to.have.property('timeout').that.equal(1000);
        });
      });

      describe('When timeout not is specified', () => {
        it('Should test method notifyUser', () => {
          const event = {message: 'Une erreur est survenue, veuillez réessayer dans quelques instants'};
          const notification = new Notification();

          notification.notifyUser(event);

          expect(notification).to.have.property('message').that.equal('Une erreur est survenue, veuillez réessayer dans quelques instants');
          expect(notification).to.have.property('timeout').that.equal(5000);
        });
      });
    });
  });

  describe('#Test resizeNotification', () => {
    let stubQuerySelector;

    before(() => {
      stubQuerySelector = sandBox.stub(document, 'querySelector').withArgs('.notif-container-content');
      sandBox.stub(Notification.prototype, 'addNotificationsEventListeners');

      stubQuerySelector.withArgs('.notif-container').returns({clientHeight: 6, style: {}});
      stubQuerySelector.withArgs('.notif-container-content').returns({clientHeight: 2, style: {}});
    });

    it('#Should test resizeNotification', () => {
      const notification = new Notification();

      notification.resizeNotification();

      expect(document.querySelector('.notif-container-content').style.position).to.equal('relative');
      expect(document.querySelector('.notif-container-content') .style.top).to.equal('2px');
    });
  });

  describe('#Test deleteNotification', () => {
    describe('When document body contains notifContainer', () => {
      before(() => {
        sandBox.stub(document.body, 'contains').returns(true);
        sandBox.stub(document.body, 'removeChild');
        sandBox.stub(Notification.prototype, 'addNotificationsEventListeners');
      });

      it('Should test deleteNotification ', () => {
        const notification = new Notification();

        notification.deleteNotification();

        expect(document.body.removeChild.calledOnce).to.be.true;
      });
    });

    describe('When document body not contains notifContainer', () => {
      before(() => {
        sandBox.stub(document, 'body').returns(null);
        sandBox.stub(Notification.prototype, 'addNotificationsEventListeners');
      });

      it('Should test deleteNotification', () => {
        const notification = new Notification();

        expect(notification.deleteNotification()).to.be.an('undefined');
      });
    });
  });

  describe('#Test createNotificationBox', () => {
    before(() => {
      sandBox.stub(document.body, 'appendChild').returns(sandBox.spy());
      sandBox.stub(Notification.prototype, 'deleteNotification');
      sandBox.stub(window, 'setTimeout').returns((callBack) => {
        callBack();
      });
      sandBox.stub(Notification.prototype, 'addNotificationsEventListeners');

      Notification.prototype.message = 'Une erreur est survenue, veuillez réessayer dans quelques instants';
    });

    it('#Sould test createNotificationBox', () => {
      const html = `
                    <div class="notif-container-content">
                        <span class="notif-container-close">X</span>
                        <p>Une erreur est survenue, veuillez réessayer dans quelques instants</p>
                    </div>
                  `;

      const notification = new Notification();

      notification.createNotificationBox();

      expect(notification.notifContainer.innerHTML).to.equal(html);
      expect(document.body.appendChild.calledOnce).to.be.true;
    });
  });
});
