import React, { useMemo } from "react";

const homeIconUrl = "./assets/icons/home.svg";
const githubIconUrl = "./assets/icons/github.svg";
const twitterIconUrl = "./assets/icons/twitter.svg";
const linkedinIconUrl = "./assets/icons/linkedin.svg";
const blogIconUrl = "./assets/icons/file-text.svg";

export type CreditProps = {
    title: string;
    homepage: string;
    github: string;
    twitter: string;
    linkedin: string;
    blog: string;
};

export type LinkIconProps = {
    tooltip: string;
    icon: string;
    url: string;
};

export const LinkIcon = (props: LinkIconProps) => {
    return (
        <a className="link" href={props.url} target="_blank" rel="noopener noreferrer">
            <img src={props.icon}></img>
        </a>
    );
};

const defaultProps: CreditProps = {
    title: "Created by w-okada. FLECT, Co., Ltd.",
    homepage: "https://www.flect.co.jp/",
    github: "https://github.com/w-okada/image-analyze-workers",
    twitter: "https://twitter.com/DannadoriYellow",
    linkedin: "https://www.linkedin.com/in/068a68187/",
    blog: "https://medium.com/@dannadori",
};

// using default parameters
// https://stackoverflow.com/questions/47774695/react-functional-component-default-props-vs-default-parameters
export const Credit = ({ title = defaultProps.title, homepage = defaultProps.homepage, github = defaultProps.github, twitter = defaultProps.twitter, linkedin = defaultProps.linkedin, blog = defaultProps.blog }: CreditProps) => {
    // const props = creditProps;

    const homepageIcon = homepage ? (
        useMemo(() => {
            return (
                <>
                    <LinkIcon tooltip="homepage" icon={homeIconUrl} url={homepage} />
                </>
            );
        }, [])
    ) : (
        <></>
    );

    const githubIcon = github ? (
        useMemo(() => {
            return <LinkIcon tooltip="github" icon={githubIconUrl} url={github} />;
        }, [])
    ) : (
        <></>
    );
    const twitterIcon = twitter ? (
        useMemo(() => {
            return <LinkIcon tooltip="twitter" icon={twitterIconUrl} url={twitter} />;
        }, [])
    ) : (
        <></>
    );
    const linkedInIcon = linkedin ? (
        useMemo(() => {
            return <LinkIcon tooltip="linkedin" icon={linkedinIconUrl} url={linkedin} />;
        }, [])
    ) : (
        <></>
    );
    const blogIcon = blog ? (
        useMemo(() => {
            return <LinkIcon tooltip="blog" icon={blogIconUrl} url={blog} />;
        }, [])
    ) : (
        <></>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", margin: "5px" }}>
            <div>
                <p className="text-slate-600" style={{ fontSize: "0.75rem" }}>
                    {title}
                </p>
            </div>
            <div style={{ display: "flex", margin: "5px" }}>
                <div style={{ margin: "2px" }}>{homepageIcon}</div>
                <div style={{ margin: "2px" }}>{githubIcon}</div>
                <div style={{ margin: "2px" }}>{twitterIcon}</div>
                <div style={{ margin: "2px" }}>{linkedInIcon}</div>
                <div style={{ margin: "2px" }}>{blogIcon}</div>
            </div>
        </div>
    );
};
