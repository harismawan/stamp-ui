import { useState } from 'react';
import {
  StampProvider, Button, Card, CardTitle, CardValue, Input, NumberInput, Modal,
  Checkbox, Switch, Slider, Badge, Tag, Avatar, AvatarGroup, Stat, EmptyState,
  Divider, Progress, Tabs, TabList, Tab, TabPanel, Accordion, AccordionItem,
  VStack, HStack, Tooltip, Popover, Menu, MenuButton, MenuList, MenuItem, Drawer,
  Alert, Breadcrumb, BreadcrumbItem, Pagination, Stepper, Table, THead, TBody,
  Tr, Th, Td, Spinner, toast, ToastViewport, confirmDialog, ConfirmViewport,
  ColorPicker, IconPicker, RadioGroup, Radio,
  Combobox, type ComboboxOption, DataTable, type DataTableColumn,
  DatePicker, DateRangePicker, type DateRange, Command, type CommandItem,
  FileUpload, TreeView, type TreeNode, TagInput,
} from '@harismawan/stamp-ui';

export function Gallery() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [open, setOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [tab, setTab] = useState('a');

  // ── Combobox (single + multi) ─────────────────────────────────────────────
  const fruitOptions: ComboboxOption[] = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
  ];
  const [fruit, setFruit] = useState<string | null>('apple');
  const [fruits, setFruits] = useState<string[]>(['apple', 'cherry']);

  // ── DataTable ──────────────────────────────────────────────────────────────
  interface Person { id: string; name: string; age: number; city: string }
  const people: Person[] = [
    { id: '1', name: 'Alice', age: 30, city: 'Jakarta' },
    { id: '2', name: 'Bob', age: 24, city: 'Bandung' },
    { id: '3', name: 'Carol', age: 41, city: 'Surabaya' },
    { id: '4', name: 'Dave', age: 35, city: 'Medan' },
    { id: '5', name: 'Eve', age: 28, city: 'Bali' },
  ];
  const personColumns: DataTableColumn<Person>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'age', header: 'Age', sortable: true, align: 'right' },
    { key: 'city', header: 'City', sortable: true },
  ];
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);

  // ── Date pickers ────────────────────────────────────────────────────────────
  const [date, setDate] = useState<Date | null>(null);
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  // ── Command palette ──────────────────────────────────────────────────────────
  const [cmdOpen, setCmdOpen] = useState(false);
  const commandItems: CommandItem[] = [
    { id: 'new', label: 'New file', shortcut: '⌘N', onSelect: () => toast.success('New file') },
    { id: 'open', label: 'Open file', shortcut: '⌘O', onSelect: () => toast.success('Open file') },
    { id: 'save', label: 'Save', shortcut: '⌘S', group: 'File', onSelect: () => toast.success('Saved') },
  ];

  // ── FileUpload ────────────────────────────────────────────────────────────────
  const [files, setFiles] = useState<File[]>([]);

  // ── TreeView ───────────────────────────────────────────────────────────────────
  const treeNodes: TreeNode[] = [
    {
      id: 'src',
      label: 'src',
      children: [
        { id: 'index', label: 'index.ts' },
        {
          id: 'components',
          label: 'components',
          children: [
            { id: 'button', label: 'Button.tsx' },
            { id: 'card', label: 'Card.tsx' },
          ],
        },
      ],
    },
    { id: 'readme', label: 'README.md' },
  ];

  // ── TagInput ─────────────────────────────────────────────────────────────────────
  const [tags, setTags] = useState<string[]>(['react', 'typescript']);

  return (
    <StampProvider mode={mode}>
      <VStack $gap={5} style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
        <HStack $gap={3}>
          <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
            Toggle {mode === 'light' ? 'dark' : 'light'}
          </Button>
          <Button $variant="outline" onClick={() => setOpen(true)}>Open modal</Button>
          <Button $variant="ghost" onClick={() => setDrawer(true)}>Open drawer</Button>
          <Button $variant="danger" onClick={() => toast.success('hi')}>Toast</Button>
          <Button onClick={() => confirmDialog({ title: 'Sure?', message: 'Delete it?' })}>Confirm</Button>
        </HStack>
        <HStack $gap={2}>
          <Badge $variant="primary">primary</Badge>
          <Badge $variant="success">ok</Badge>
          <Tag onRemove={() => {}}>removable</Tag>
          <Spinner />
        </HStack>
        <Card><CardTitle>Balance</CardTitle><CardValue>1.000.000</CardValue></Card>
        <Stat label="Net worth" value="12.500.000" delta={4.2} deltaType="up" />
        <Input placeholder="text" />
        <NumberInput value="1000000" onChange={() => {}} />
        <Checkbox label="check me" checked onChange={() => {}} />
        <Switch label="toggle" checked onChange={() => {}} />
        <Slider value={40} onChange={() => {}} />
        <Progress value={60} />
        <RadioGroup name="g" value="x" onChange={() => {}}>
          <Radio value="x" label="X" />
          <Radio value="y" label="Y" />
        </RadioGroup>
        <ColorPicker value="#FFDE15" onChange={() => {}} />
        <IconPicker value="home" onChange={() => {}} />
        <Avatar name="Haris Mawan" /><AvatarGroup max={2}><Avatar name="A B" /><Avatar name="C D" /><Avatar name="E F" /></AvatarGroup>
        <Tabs value={tab} onChange={setTab}>
          <TabList><Tab value="a">A</Tab><Tab value="b">B</Tab></TabList>
          <TabPanel value="a">Panel A</TabPanel><TabPanel value="b">Panel B</TabPanel>
        </Tabs>
        <Accordion type="single">
          <AccordionItem value="1" title="Section 1">Body 1</AccordionItem>
          <AccordionItem value="2" title="Section 2">Body 2</AccordionItem>
        </Accordion>
        <Alert $variant="info" title="Heads up">An inline alert.</Alert>
        <HStack $gap={3}>
          <Tooltip content="tip"><Button>Hover me</Button></Tooltip>
          <Popover trigger={<Button>Popover</Button>}>Popover content</Popover>
          <Menu>
            <MenuButton>Menu</MenuButton>
            <MenuList><MenuItem onSelect={() => {}}>One</MenuItem><MenuItem onSelect={() => {}}>Two</MenuItem></MenuList>
          </Menu>
        </HStack>
        <Breadcrumb><BreadcrumbItem href="/">Home</BreadcrumbItem><BreadcrumbItem>Here</BreadcrumbItem></Breadcrumb>
        <Pagination page={2} pageCount={10} onChange={() => {}} />
        <Stepper active={1} steps={[{ label: 'One' }, { label: 'Two' }, { label: 'Three' }]} />
        <Table><THead><Tr><Th>Name</Th><Th>Amt</Th></Tr></THead><TBody><Tr><Td>Coffee</Td><Td>25.000</Td></Tr></TBody></Table>
        <Combobox options={fruitOptions} value={fruit} onChange={setFruit} placeholder="Pick a fruit" clearable />
        <Combobox multiple options={fruitOptions} value={fruits} onChange={setFruits} placeholder="Pick fruits" />
        <DataTable
          columns={personColumns}
          data={people}
          rowKey={(p) => p.id}
          selectable
          selectedKeys={selectedPeople}
          onSelectionChange={setSelectedPeople}
          pageSize={3}
          defaultSort={{ key: 'name', dir: 'asc' }}
          caption="People"
        />
        <HStack $gap={3}>
          <DatePicker value={date} onChange={setDate} clearable />
          <DateRangePicker value={range} onChange={setRange} clearable />
        </HStack>
        <Button onClick={() => setCmdOpen(true)}>Open command palette</Button>
        <Command open={cmdOpen} onClose={() => setCmdOpen(false)} items={commandItems} />
        <FileUpload value={files} onChange={setFiles} multiple maxFiles={3} />
        <TreeView nodes={treeNodes} defaultExpandedIds={['src', 'components']} />
        <TagInput value={tags} onChange={setTags} placeholder="Add a tag" />
        <EmptyState title="Nothing here" description="Add your first item." />
        <Divider label="end" />
        <Modal open={open} onClose={() => setOpen(false)} title="Demo modal">Modal body</Modal>
        <Drawer open={drawer} onClose={() => setDrawer(false)} side="right" title="Demo drawer">Drawer body</Drawer>
      </VStack>
      <ToastViewport />
      <ConfirmViewport />
    </StampProvider>
  );
}
