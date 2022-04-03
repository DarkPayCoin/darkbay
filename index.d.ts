import CID from 'cids';
import { IpfsCid as RuntimeIpfsCid } from '../substrate/interfaces';
export { CID };
export declare type CommonContent = CommentContent | ProductContent | StorefrontContent | ProfileContent | OrderingContent | SharedProductContent;
export declare type Activity = {
    account: string;
    block_number: string;
    event_index: number;
    event: EventsName;
    /** Account id. */
    following_id?: string;
    storefront_id?: string;
    product_id?: string;
    comment_id?: string;
    ordering_id?: string;
    /** Date of this activity. Example: "2020-12-03T19:22:36.000Z" */
    date: string;
    aggregated: boolean;
    agg_count: number;
};
declare type FilterByTags = {
    data: string[];
};
declare type Url = {
    data: string;
};
declare type NavTabContent = FilterByTags | Url;
declare type ContentType = 'by-tag' | 'url';
export declare type NavTab = {
    id: number;
    type: ContentType;
    content: NavTabContent;
    title: string;
    description: string;
    hidden: boolean;
};
export declare type NamedLink = {
    name: string;
    url?: string;
};
export declare type StorefrontContent = {
    name: string;
    about: string;
    image: string;
    email: string;
    tags: string[];
    links: string[] | NamedLink[];
    navTabs?: NavTab[];
};
export declare type SharedProductContent = {
    body: string;
};
export declare type ProposalContent = {
    network: 'kusama' | 'polkadot';
    proposalIndex: number;
};
export declare type ProductExt = {
    proposal?: ProposalContent;
};
export declare type ProductContent = SharedProductContent & {
    title: string;
    price: number;
    image: string;
    tags: string[];
    canonical: string;
    ext?: ProductExt;
};
export declare type OrderingContent = {
    body: string;
    address1: string;
    address2: string;
    postal_code: string;
    city: string;
    country: string;
    send_proof_image: string;
    email: string;
    bescrow: string;
    sescrow: string;
    orderingcontent_state: string;
    orderingcontent_total: string;
    links: string[] | NamedLink[];
};
export declare type CommentContent = {
    body: string;
};
export declare type ProfileContent = {
    name: string;
    avatar: string;
    about: string;
};
export declare type IpfsCid = string | CID | RuntimeIpfsCid;
export declare type EventsName = 'AccountFollowed' | 'StorefrontFollowed' | 'StorefrontCreated' | 'CommentCreated' | 'CommentReplyCreated' | 'ProductCreated' | 'ProductShared' | 'CommentShared' | 'ProductReactionCreated' | 'OrderingCreated' | 'CommentReactionCreated';
export declare type Counts = {
    productsCount: number;
    commentsCount: number;
    orderingsCount: number;
    reactionsCount: number;
    followsCount: number;
    storefrontsCount: number;
    activitiesCount: number;
};
