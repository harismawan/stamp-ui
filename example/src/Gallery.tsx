import {
  Accordion,
  AccordionItem,
  Alert,
  Avatar,
  AvatarFrame,
  AvatarGroup,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardTitle,
  CardValue,
  Carousel,
  Checkbox,
  ChipGroup,
  ColorPicker,
  Combobox,
  type ComboboxOption,
  Command,
  type CommandItem,
  ConfirmViewport,
  DataTable,
  type DataTableColumn,
  DatePicker,
  type DateRange,
  DateRangePicker,
  Divider,
  Drawer,
  EmptyState,
  FileUpload,
  FilterSection,
  FilterSheet,
  Footer,
  FooterColumn,
  GoalProgress,
  HStack,
  IconPicker,
  Input,
  MediaCard,
  MediaCardBadge,
  MediaCardBody,
  MediaCardCover,
  MediaGallery,
  type MediaGalleryItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  NumberInput,
  Pagination,
  Popover,
  // marketplace pack
  PriceTag,
  Progress,
  Radio,
  RadioGroup,
  RankList,
  type RankListItem,
  Rating,
  SearchBar,
  Slider,
  Spinner,
  StampProvider,
  Stat,
  Stepper,
  Switch,
  TBody,
  THead,
  Tab,
  TabList,
  TabPanel,
  Table,
  Tabs,
  Tag,
  TagInput,
  Td,
  Th,
  ToastViewport,
  Tooltip,
  TopNav,
  TopNavActions,
  TopNavLinks,
  Tr,
  type TreeNode,
  TreeView,
  VStack,
  confirmDialog,
  toast,
  useDisclosure,
} from '@harismawan/stamp-ui';
import { useState } from 'react';

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
  interface Person {
    id: string;
    name: string;
    age: number;
    city: string;
  }
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
    {
      id: 'save',
      label: 'Save',
      shortcut: '⌘S',
      group: 'File',
      onSelect: () => toast.success('Saved'),
    },
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

  // ── Marketplace pack ──────────────────────────────────────────────────────────

  // ChipGroup
  const [genre, setGenre] = useState<string | null>('illustration');
  const [formats, setFormats] = useState<string[]>(['photo']);

  // Rating
  const [stars, setStars] = useState(0);

  // SearchBar
  const [query, setQuery] = useState('');

  // MediaGallery
  const galleryItems: MediaGalleryItem[] = [
    { src: 'https://picsum.photos/seed/mg1/800/600', alt: 'Forest path' },
    { src: 'https://picsum.photos/seed/mg2/800/600', alt: 'Mountain lake' },
    { src: 'https://picsum.photos/seed/mg3/800/600', alt: 'Desert dunes' },
  ];
  const [galleryIdx, setGalleryIdx] = useState(0);

  // RankList
  const supporters: RankListItem[] = [
    { id: '1', label: 'Sakura', avatarSrc: undefined, value: 'Rp 500.000' },
    { id: '2', label: 'Shirou', value: 'Rp 320.000' },
    { id: '3', label: 'Archer', value: 'Rp 180.000' },
  ];

  // FilterSheet
  const filterDisc = useDisclosure();
  const [filterGenres, setFilterGenres] = useState<string[]>([]);

  // Carousel items
  const carouselDrops = [
    {
      id: 'c1',
      title: 'Neon Dreams',
      cover: 'https://picsum.photos/seed/c1/300/400',
      price: 'Rp 85.000',
    },
    {
      id: 'c2',
      title: 'Forest Spirit',
      cover: 'https://picsum.photos/seed/c2/300/400',
      price: 'Rp 65.000',
    },
    {
      id: 'c3',
      title: 'Cyber City',
      cover: 'https://picsum.photos/seed/c3/300/400',
      price: 'Rp 120.000',
    },
    {
      id: 'c4',
      title: 'Ocean Bloom',
      cover: 'https://picsum.photos/seed/c4/300/400',
      price: 'Rp 75.000',
    },
  ];

  return (
    <StampProvider mode={mode}>
      {/* ── TopNav ─────────────────────────────────────────────────────────── */}
      <TopNav
        logo={<strong style={{ fontSize: 18 }}>Tokoshi</strong>}
        center={
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search drops…"
            $size="lg"
            clearable
          />
        }
        sticky={false}
      >
        <TopNavLinks>
          <a href="#explore">Explore</a>
          <a href="#creators">Creators</a>
        </TopNavLinks>
        <TopNavActions>
          <Button $variant="outline" $size="sm">
            Log in
          </Button>
          <Button $size="sm">Sign up</Button>
        </TopNavActions>
      </TopNav>

      <VStack $gap={5} style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
        <HStack $gap={3}>
          <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
            Toggle {mode === 'light' ? 'dark' : 'light'}
          </Button>
          <Button $variant="outline" onClick={() => setOpen(true)}>
            Open modal
          </Button>
          <Button $variant="ghost" onClick={() => setDrawer(true)}>
            Open drawer
          </Button>
          <Button $variant="danger" onClick={() => toast.success('hi')}>
            Toast
          </Button>
          <Button onClick={() => confirmDialog({ title: 'Sure?', message: 'Delete it?' })}>
            Confirm
          </Button>
        </HStack>
        <HStack $gap={2}>
          <Badge $variant="primary">primary</Badge>
          <Badge $variant="success">ok</Badge>
          <Tag onRemove={() => {}}>removable</Tag>
          <Spinner />
        </HStack>
        <Card>
          <CardTitle>Balance</CardTitle>
          <CardValue>1.000.000</CardValue>
        </Card>
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
        <Avatar name="Haris Mawan" />
        <AvatarGroup max={2}>
          <Avatar name="A B" />
          <Avatar name="C D" />
          <Avatar name="E F" />
        </AvatarGroup>
        <Tabs value={tab} onChange={setTab}>
          <TabList>
            <Tab value="a">A</Tab>
            <Tab value="b">B</Tab>
          </TabList>
          <TabPanel value="a">Panel A</TabPanel>
          <TabPanel value="b">Panel B</TabPanel>
        </Tabs>
        <Accordion type="single">
          <AccordionItem value="1" title="Section 1">
            Body 1
          </AccordionItem>
          <AccordionItem value="2" title="Section 2">
            Body 2
          </AccordionItem>
        </Accordion>
        <Alert $variant="info" title="Heads up">
          An inline alert.
        </Alert>
        <HStack $gap={3}>
          <Tooltip content="tip">
            <Button>Hover me</Button>
          </Tooltip>
          <Popover trigger={<Button>Popover</Button>}>Popover content</Popover>
          <Menu>
            <MenuButton>Menu</MenuButton>
            <MenuList>
              <MenuItem onSelect={() => {}}>One</MenuItem>
              <MenuItem onSelect={() => {}}>Two</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem>Here</BreadcrumbItem>
        </Breadcrumb>
        <Pagination page={2} pageCount={10} onChange={() => {}} />
        <Stepper active={1} steps={[{ label: 'One' }, { label: 'Two' }, { label: 'Three' }]} />
        <Table>
          <THead>
            <Tr>
              <Th>Name</Th>
              <Th>Amt</Th>
            </Tr>
          </THead>
          <TBody>
            <Tr>
              <Td>Coffee</Td>
              <Td>25.000</Td>
            </Tr>
          </TBody>
        </Table>
        <Combobox
          options={fruitOptions}
          value={fruit}
          onChange={setFruit}
          placeholder="Pick a fruit"
          clearable
        />
        <Combobox
          multiple
          options={fruitOptions}
          value={fruits}
          onChange={setFruits}
          placeholder="Pick fruits"
        />
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

        <Divider label="marketplace pack" />

        {/* ── PriceTag ──────────────────────────────────────────────────────── */}
        <HStack $gap={4} $align="center">
          <PriceTag $size="sm">Rp 25.000</PriceTag>
          <PriceTag $size="md" original="Rp 150.000">
            Rp 99.000
          </PriceTag>
          <PriceTag $size="lg">Rp 350.000</PriceTag>
        </HStack>

        {/* ── Rating ────────────────────────────────────────────────────────── */}
        <HStack $gap={4} $align="center">
          <Rating value={4.5} count={128} />
          <Rating value={stars} onChange={setStars} label="Rate this item" />
        </HStack>

        {/* ── ChipGroup ─────────────────────────────────────────────────────── */}
        <VStack $gap={3}>
          <ChipGroup
            options={['illustration', 'photo', 'video', 'audio']}
            value={genre}
            onChange={(v) => setGenre(v as string)}
          />
          <ChipGroup
            options={['JPG', 'PNG', 'SVG', 'PDF']}
            value={formats}
            onChange={(v) => setFormats(v as string[])}
            multiple
          />
        </VStack>

        {/* ── SearchBar ─────────────────────────────────────────────────────── */}
        <SearchBar
          value={query}
          onChange={setQuery}
          onSubmit={(v) => toast.success(`Search: ${v}`)}
          placeholder="Search creators…"
          $size="lg"
          clearable
        />

        {/* ── Product MediaCard ─────────────────────────────────────────────── */}
        <div style={{ maxWidth: 280 }}>
          <MediaCard $hover>
            <MediaCardCover
              src="https://picsum.photos/seed/drop1/560/420"
              alt="Mystic Forest Pack"
              $aspect="4:3"
            >
              <MediaCardBadge>NEW</MediaCardBadge>
            </MediaCardCover>
            <MediaCardBody>
              <strong>Mystic Forest Pack</strong>
              <HStack $gap={2} $align="center">
                <PriceTag original="Rp 150.000">Rp 99.000</PriceTag>
                <Rating value={4.2} count={34} size={14} />
              </HStack>
            </MediaCardBody>
          </MediaCard>
        </div>

        {/* ── AvatarFrame with level badge ──────────────────────────────────── */}
        <div style={{ paddingBottom: 20 }}>
          <AvatarFrame
            src="https://picsum.photos/seed/creator1/120/120"
            name="Tohsaka Rin"
            size={80}
            $aspect="1:1"
            badge={<Badge $variant="primary">Lv 12</Badge>}
          />
        </div>

        {/* ── RankList ──────────────────────────────────────────────────────── */}
        <RankList items={supporters} highlightTop={1} />

        {/* ── GoalProgress ──────────────────────────────────────────────────── */}
        <GoalProgress
          label="Monthly goal"
          valueLabel="Rp 119.000 / Rp 350.000 — 34%"
          value={119_000}
          max={350_000}
          $variant="primary"
        />

        {/* ── Carousel of MediaCards ────────────────────────────────────────── */}
        <Carousel ariaLabel="Featured drops" $gap={4}>
          {carouselDrops.map((d) => (
            <div key={d.id} style={{ width: 200 }}>
              <MediaCard $hover>
                <MediaCardCover src={d.cover} alt={d.title} $aspect="3:4" />
                <MediaCardBody>
                  <strong style={{ fontSize: 13 }}>{d.title}</strong>
                  <PriceTag $size="sm">{d.price}</PriceTag>
                </MediaCardBody>
              </MediaCard>
            </div>
          ))}
        </Carousel>

        {/* ── MediaGallery ──────────────────────────────────────────────────── */}
        <MediaGallery
          items={galleryItems}
          index={galleryIdx}
          onIndexChange={setGalleryIdx}
          $aspect="4:3"
        />

        {/* ── FilterSheet ───────────────────────────────────────────────────── */}
        <Button $variant="outline" onClick={filterDisc.open}>
          Open filter
        </Button>
        <FilterSheet
          open={filterDisc.isOpen}
          onClose={filterDisc.close}
          onApply={() => toast.success('Filters applied')}
          onResetAll={() => setFilterGenres([])}
          title="Filter drops"
        >
          <FilterSection title="Genre" onReset={() => setFilterGenres([])}>
            <ChipGroup
              options={['illustration', 'photo', 'video', 'audio']}
              value={filterGenres}
              onChange={(v) => setFilterGenres(v as string[])}
              multiple
            />
          </FilterSection>
          <FilterSection title="Price range">
            <HStack $gap={2}>
              <Input placeholder="Min" style={{ width: 100 }} />
              <Input placeholder="Max" style={{ width: 100 }} />
            </HStack>
          </FilterSection>
        </FilterSheet>

        <Divider label="end" />
        <Modal open={open} onClose={() => setOpen(false)} title="Demo modal">
          Modal body
        </Modal>
        <Drawer open={drawer} onClose={() => setDrawer(false)} side="right" title="Demo drawer">
          Drawer body
        </Drawer>
      </VStack>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <Footer bottom={<span>© 2026 Tokoshi. All rights reserved.</span>}>
        <FooterColumn title="Explore">
          <a href="#drops">New drops</a>
          <a href="#creators">Creators</a>
          <a href="#trending">Trending</a>
        </FooterColumn>
        <FooterColumn title="Support">
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
          <a href="#terms">Terms</a>
        </FooterColumn>
      </Footer>

      <ToastViewport />
      <ConfirmViewport />
    </StampProvider>
  );
}
