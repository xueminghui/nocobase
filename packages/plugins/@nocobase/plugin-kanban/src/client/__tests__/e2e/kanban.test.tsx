import { test, expect } from '@nocobase/test/client';
import { generalWithSingleSelect } from './utils';

//在页面中可以创建看板区块
test.describe('configure Kanban', () => {
  test(' create kanban blocks in the page', async ({ page, mockPage, mockCollections, mockRecord }) => {
    await mockCollections(generalWithSingleSelect);
    await mockRecord('general');
    await mockPage().goto();
    await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
    await expect(page.getByRole('menuitem', { name: 'form Kanban right' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'form Kanban right' }).click();
    await page.getByRole('menuitem', { name: 'form Kanban right' }).hover();
    await page.getByRole('menuitem', { name: 'General' }).click();
    await page.getByLabel('block-item-Select-Grouping field').getByLabel('Search').click();
    await page.getByRole('option', { name: 'Single select' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByLabel('block-item-CardItem-general-kanban')).toBeVisible();
  });
});

//看板的字段配置
test('configure fields in kanban block', async ({ page, mockPage, mockRecord, mockCollections }) => {
  await mockCollections(generalWithSingleSelect);
  await mockRecord('general', { singleLineText: 'singleLineText', manyToOne: { id: 1 } });
  await mockPage().goto();
  await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
  await expect(page.getByRole('menuitem', { name: 'form Kanban right' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'form Kanban right' }).click();
  await page.getByRole('menuitem', { name: 'form Kanban right' }).hover();
  await page.getByRole('menuitem', { name: 'General' }).click();
  await page.getByLabel('block-item-Select-Grouping field').getByLabel('Search').click();
  await page.getByRole('option', { name: 'Single select' }).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByLabel('block-item-CardItem-general-kanban')).toBeVisible();
  //添加普通字段
  await page.getByLabel('block-item-Kanban.Card-general-kanban').hover();
  await page.getByLabel('designer-schema-initializer-Kanban.Card-Kanban.Card.Designer-general').hover();
  await page.getByRole('menuitem', { name: 'ID', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Single line text' }).click();
  expect(await page.getByLabel('block-item-CollectionField-general-kanban-general.singleLineText').innerText()).toBe(
    'singleLineText',
  );
  expect(await page.getByLabel('block-item-CollectionField-general-kanban-general.id').innerText()).toBe('1');
  //移除字段
  await page.getByLabel('block-item-Kanban.Card-general-kanban').hover();
  await page.getByLabel('designer-schema-initializer-Kanban.Card-Kanban.Card.Designer-general').hover();
  await page.getByRole('menuitem', { name: 'ID', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Single line text' }).click();
  await expect(
    await page.getByLabel('block-item-CollectionField-general-kanban-general.singleLineText'),
  ).not.toBeVisible();
  await expect(await page.getByLabel('block-item-CollectionField-general-kanban-general.id')).not.toBeVisible();

  //添加关系字段,断言请求的appends是否符合预期
  try {
    const [request] = await Promise.all([
      page.waitForRequest((request) => request.url().includes('api/general:list')),
      page.getByRole('menuitem', { name: 'Many to one', exact: true }).click(),
    ]);
    // 获取请求参数
    const requestUrl = request.url();
    // 解析查询参数
    const queryParams = new URLSearchParams(new URL(requestUrl).search);
    const appends = queryParams.get('appends[]');
    await expect(appends).toContain('manyToOne');
  } finally {
    console.log('error');
  }
  await expect(await page.getByLabel('block-item-CollectionField-general-kanban-general.manyToOne')).toBeVisible();
  //修改标题字段
  await page.getByLabel('schema-initializer-ActionBar-KanbanActionInitializers-general').click();
  await page.getByLabel('block-item-CollectionField-general-kanban-general.manyToOne').hover();
  await page.getByLabel('designer-schema-settings-CollectionField-FormItem.Designer-general-general.manyToOne').hover();
  await page.getByText('Title field').click();
  await page.getByRole('option', { name: 'Username' }).click();
  //显示新的标题字段符合预期
  expect(await page.getByLabel('block-item-CollectionField-general-kanban-general.manyToOne').innerText()).toBe(
    'nocobase',
  );
});

//看板的区块参数配置
test('configure params in kanban block', async ({ page, mockPage, mockRecords, mockCollections }) => {
  await mockCollections(generalWithSingleSelect);
  await mockRecords('general', 100);
  await mockPage().goto();
  await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
  await expect(page.getByRole('menuitem', { name: 'form Kanban right' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'form Kanban right' }).click();
  await page.getByRole('menuitem', { name: 'form Kanban right' }).hover();
  await page.getByRole('menuitem', { name: 'General' }).click();
  await page.getByLabel('block-item-Select-Grouping field').getByLabel('Search').click();
  await page.getByRole('option', { name: 'Single select' }).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByLabel('block-item-CardItem-general-kanban')).toBeVisible();
  //固定区块
  await page.getByLabel('block-item-CardItem-general-kanban').hover();
  await page.getByLabel('designer-schema-settings-CardItem-Kanban.Designer-general').hover();
  await page.getByRole('menuitem', { name: 'Fix block' }).click();
  const kanbanBoard = page.getByLabel('block-item-CardItem-general-kanban');
  const kanbanBoardHeight = await kanbanBoard.evaluate((element) => {
    const computedStyle = window.getComputedStyle(element);
    return parseInt(computedStyle.height, 10);
  });
  const windowHeight = await page.evaluate(() => {
    return window.innerHeight;
  });
  const expectedHeight = windowHeight - 147;
  await page.waitForTimeout(1000);
  // 断言高度为预期值
  expect(kanbanBoardHeight).toBe(expectedHeight);
  //设置数据范围
  await page.getByLabel('block-item-CardItem-general-kanban').hover();
  await page.getByLabel('designer-schema-settings-CardItem-Kanban.Designer-general').hover();
  await page.getByRole('menuitem', { name: 'Set the data scope' }).click();
  await page.getByText('Add condition', { exact: true }).click();
  await page.getByTestId('select-filter-field').getByLabel('Search').click();
  await page.getByTitle('ID').getByText('ID').click();
  await page.getByRole('spinbutton').fill('1');
  try {
    const [request] = await Promise.all([
      page.waitForRequest((request) => request.url().includes('api/general:list')),
      page.getByRole('button', { name: 'OK' }).click(),
    ]);
    const requestUrl = request.url();
    const queryParams = new URLSearchParams(new URL(requestUrl).search);
    const filter = queryParams.get('filter');
    //请求参数符合预期
    expect(JSON.parse(filter)).toEqual({ $and: [{ id: { $eq: 1 } }] });
  } catch {
    console.log('error');
  }
});

//看板的操作配置
test('configure action in kanban block', async ({ page, mockPage, mockCollections }) => {
  await mockCollections(generalWithSingleSelect);
  await mockPage().goto();
  await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
  await expect(page.getByRole('menuitem', { name: 'form Kanban right' })).toBeVisible();
  await page.getByRole('menuitem', { name: 'form Kanban right' }).hover();
  await page.getByRole('menuitem', { name: 'General' }).click();
  await page.getByLabel('block-item-Select-Grouping field').getByLabel('Search').click();
  await page.getByRole('option', { name: 'Single select' }).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByLabel('block-item-CardItem-general-kanban')).toBeVisible();
  await expect(page.getByLabel('schema-initializer-ActionBar-KanbanActionInitializers-general')).toBeVisible();
  await page.getByLabel('schema-initializer-ActionBar-KanbanActionInitializers-general').click();
  await page.getByRole('menuitem', { name: 'Filter' }).getByRole('switch').click();
  await page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch').click();
  //按钮正常显示
  await expect(page.getByLabel('action-Filter.Action-Filter-filter-general-kanban')).toBeVisible();
  await expect(page.getByLabel('action-Action-Add ')).toBeVisible();
  //添加数据
  await page.getByLabel('action-Action-Add new-create-general-kanban').click();
  await page.getByLabel('schema-initializer-Grid-CreateFormBlockInitializers-general').click();
  await page.getByRole('menuitem', { name: 'form Form' }).click();
  await page.mouse.move(300, 0);
  await page.getByLabel('schema-initializer-Grid-FormItemInitializers-general').click();
  await page.getByRole('menuitem', { name: 'Single Select' }).click();
  await page.getByLabel('Search').click();
  await page.getByRole('option', { name: 'option1' }).click();
  await page.getByLabel('schema-initializer-ActionBar-CreateFormActionInitializers-general').hover();
  await page.getByRole('menuitem', { name: 'Submit' }).click();
  await page.getByLabel('action-Action-Submit-submit-general-form').click();

  await page.getByLabel('block-item-Kanban.Card-general-kanban').hover();
  await page.getByLabel('designer-schema-initializer-Kanban.Card-Kanban.Card.Designer-general').hover();
  await page.getByRole('menuitem', { name: 'ID', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Created at' }).getByRole('switch').click();
  await page.getByRole('menuitem', { name: 'Single Select' }).getByRole('switch').click();

  //拖拽看板
  const sourceElement = await page.getByLabel('block-item-Kanban.Card-general-kanban');
  await sourceElement.click();
  await page.getByLabel('drawer-Action.Container-general-View record-mask').click();
  const { x, y } = await sourceElement.boundingBox();
  const targetElement = await page.getByTestId('column-option2');
  await sourceElement.hover();
  await sourceElement.dragTo(targetElement, {
    force: true,
    sourcePosition: { x, y },
    targetPosition: { x: x + 100, y },
  });
});