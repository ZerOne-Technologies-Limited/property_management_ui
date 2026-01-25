import { createLink, type LinkComponent } from "@tanstack/react-router"

type BasicLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    //other props
}

const BasicLinkComponent = (
    {className, ...props}: BasicLinkProps,
    ref: React.Ref<HTMLAnchorElement>
) => {
    return <a ref = {ref} {...props } className={`${className} text-blue-500 hover:underline`} />
}

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const Navlink: LinkComponent<typeof BasicLinkComponent> = (props) => {
    return (
        <CreatedLinkComponent
            activeProps={{className: 'font-bold text-blue-700'}}
            {...props}
        />
    )
}