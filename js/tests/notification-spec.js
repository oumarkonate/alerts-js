const chai = require('chai'),
      sinon = require('sinon'),
      jsdom = require("jsdom"),
      { JSDOM } = jsdom;

const Notification = require('../notification');

describe('#Test Notification', () => {
  const sandBox = sinon.createSandbox(), 
        expect = chai.expect,
        dom = new JSDOM('');        

  let notification, 
      stubQuerySelector;

  window = dom.window;
  document = dom.window.document;

  beforeEach(() => {
    stubQuerySelector = sandBox.stub(document, 'querySelector');
    sandBox.stub(Notification.prototype, 'addNotificationsEventListeners');
    
    notification = new Notification();
  });

  afterEach(() => {
    if (sandBox.restore) {
      sandBox.restore();
    }
  });

  it('Should test constructor', () => {
    expect(notification).to.have.property('timeout').to.equal(5000);
    expect(notification).to.have.property('notifContainer');
    expect(notification.addNotificationsEventListeners.calledOnce).to.be.true;
  });

  describe('#Test notifyUser', () => {
    context('When event message is empty', () => {
      it('Should return', () => {
        expect(notification.notifyUser({})).to.be.an('undefined');
      });
    });

    describe('When event message is not empty', () => {
      let stubAddEventListener;

      beforeEach(() => {
        stubQuerySelector.withArgs('.notif-container-close');
        stubAddEventListener = sandBox.stub(window, 'addEventListener');
        sandBox.stub(notification, 'deleteNotification');
        sandBox.stub(notification, 'createNotificationBox');
        sandBox.stub(notification, 'resizeNotification');
      });

      afterEach(() => {
        if (sandBox.restore) {
          sandBox.restore();
        }
      });

      context('When timeout is specified', () => {
        it('Should test method notifyUser', () => {
          const event = {message: 'Une erreur est survenue, veuillez réessayer dans quelques instants', timeout: 1000};

          stubQuerySelector.returns({addEventListener: sandBox.spy()});

          notification.notifyUser(event);

          expect(notification).to.have.property('message').that.equal('Une erreur est survenue, veuillez réessayer dans quelques instants');
          expect(notification).to.have.property('timeout').that.equal(1000);
        });
      });

      context('When timeout not is specified', () => {
        it('Should test method notifyUser', () => {
          const event = {message: 'Une erreur est survenue, veuillez réessayer dans quelques instants'};

          stubQuerySelector.returns({addEventListener: sandBox.spy()});

          notification.notifyUser(event);

          expect(notification).to.have.property('message').that.equal('Une erreur est survenue, veuillez réessayer dans quelques instants');
          expect(notification).to.have.property('timeout').that.equal(5000);
        });
      });
    });
  });

  describe('#Test resizeNotification', () => {
    it('#Should test resizeNotification', () => {
      stubQuerySelector.withArgs('.notif-container').returns({clientHeight: 6, style: {}});
      stubQuerySelector.withArgs('.notif-container-content').returns({clientHeight: 2, style: {}});

      const element = document.querySelector('.notif-container-content');

      notification.resizeNotification();

      expect(element.style.position).to.equal('relative');
      expect(element.style.top).to.equal('2px');
    });
  });

  describe('#Test deleteNotification', () => {
    context('When document body contains notifContainer', () => {
      it('Should test deleteNotification ', () => {
        sandBox.stub(document.body, 'contains').returns(true);
        sandBox.stub(document.body, 'removeChild');

        notification.deleteNotification();

        expect(document.body.removeChild.calledOnce).to.be.true;
      });
    });

    context('When document body not contains notifContainer', () => {
      it('Should test deleteNotification', () => {
        sandBox.stub(document, 'body').returns(null);

        expect(notification.deleteNotification()).to.be.an('undefined');
      });
    });
  });

  describe('#Test createNotificationBox', () => {
    it('#Sould test createNotificationBox', () => {
      Notification.prototype.message = 'Une erreur est survenue, veuillez réessayer dans quelques instants';

      sandBox.stub(document.body, 'appendChild').returns(sandBox.spy());
      sandBox.stub(notification, 'deleteNotification');
      sandBox.stub(window, 'setTimeout').returns((callBack) => {
        callBack();
      });

      const html = `
                    <div class="notif-container-content">
                        <span class="notif-container-close">X</span>
                        <p>Une erreur est survenue, veuillez réessayer dans quelques instants</p>
                    </div>
                  `;

      notification.createNotificationBox();

      expect(notification.notifContainer.innerHTML).to.equal(html);
      expect(document.body.appendChild.calledOnce).to.be.true;
      expect(notification.deleteNotification.calledOnce).to.be.true;
    });
  });
});
