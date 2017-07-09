import { CliStablePage } from './app.po';

describe('cli-stable App', () => {
  let page: CliStablePage;

  beforeEach(() => {
    page = new CliStablePage();
  });

  it('should display message mfgt status', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('mfgt status');
  });
});
